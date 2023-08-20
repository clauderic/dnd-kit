import {Position, type Shape} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import {batch, computed, signal} from '@dnd-kit/state';

import type {Draggable, Droppable, UniqueIdentifier} from '../nodes';

import type {DragDropManager} from './manager';

export enum Status {
  Idle = 'idle',
  Initializing = 'initializing',
  Dragging = 'dragging',
  Dropping = 'dropping',
}

export type Serializable = {
  [key: string]: string | number | null | Serializable | Serializable[];
};

export interface DragOperation<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  activatorEvent: Event | null;
  position: Position;
  transform: Coordinates;
  status: {
    current: Status;
    initialized: boolean;
    initializing: boolean;
    dragging: boolean;
    dropping: boolean;
    idle: boolean;
  };
  shape: Shape | null;
  source: T | null;
  target: U | null;
  data?: Serializable;
}

export type DragActions<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = ReturnType<typeof DragOperationManager<T, U, V>>['actions'];

export function DragOperationManager<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
>(manager: V) {
  const {
    registry: {draggables, droppables},
    monitor,
  } = manager;
  const status = signal<Status>(Status.Idle);
  const shape = signal<Shape | null>(null);
  const position = new Position({x: 0, y: 0});
  const activatorEvent = signal<Event | null>(null);
  const sourceIdentifier = signal<UniqueIdentifier | null>(null);
  const targetIdentifier = signal<UniqueIdentifier | null>(null);
  const dragging = computed(() => status.value === Status.Dragging);
  const initialized = computed(() => status.value !== Status.Idle);
  const initializing = computed(() => status.value === Status.Initializing);
  const idle = computed(() => status.value === Status.Idle);
  const dropping = computed(() => status.value === Status.Dropping);
  let previousSource: T | undefined;
  const source = computed<T | null>(() => {
    const identifier = sourceIdentifier.value;

    if (identifier == null) return null;

    const value = draggables.get(identifier);

    if (value) {
      // It's possible for the source to unmount during the drag operation
      previousSource = value;
    }

    return value ?? previousSource ?? null;
  });
  const target = computed<U | null>(() => {
    const identifier = targetIdentifier.value;
    return identifier != null ? droppables.get(identifier) ?? null : null;
  });

  const transform = computed(() => {
    const {x, y} = position.delta;
    const {modifiers} = manager;
    let transform = {x, y};
    const operation: Omit<DragOperation<T, U>, 'transform'> = {
      activatorEvent: activatorEvent.peek(),
      source: source.peek(),
      target: target.peek(),
      status: {
        current: status.peek(),
        idle: idle.peek(),
        initializing: initializing.peek(),
        initialized: initialized.peek(),
        dragging: dragging.peek(),
        dropping: dropping.peek(),
      },
      shape: shape.peek(),
      position,
    };

    for (const modifier of modifiers) {
      transform = modifier.apply({...operation, transform});
    }

    return transform;
  });

  const operation: DragOperation<T, U> = {
    get activatorEvent() {
      return activatorEvent.value;
    },
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
    status: {
      get current() {
        return status.value;
      },
      get idle() {
        return idle.value;
      },
      get initializing() {
        return initializing.value;
      },
      get initialized() {
        return initialized.value;
      },
      get dragging() {
        return dragging.value;
      },
      get dropping() {
        return dropping.value;
      },
    },
    get shape() {
      return shape.value;
    },
    set shape(value: Shape | null) {
      if (value && shape.peek()?.equals(value)) {
        return;
      }

      shape.value = value;
    },
    get transform() {
      return transform.value;
    },
    position,
  };

  const reset = () => {
    batch(() => {
      status.value = Status.Idle;
      sourceIdentifier.value = null;
      targetIdentifier.value = null;
      shape.value = null;
      position.reset({x: 0, y: 0});
    });
  };

  return {
    operation,
    actions: {
      setDragSource(identifier: UniqueIdentifier) {
        sourceIdentifier.value = identifier;
      },
      setDropTarget(
        identifier: UniqueIdentifier | null | undefined
      ): Promise<void> {
        const id = identifier ?? null;

        if (targetIdentifier.peek() === id) {
          return Promise.resolve();
        }

        targetIdentifier.value = id;

        monitor.dispatch('dragover', {
          operation: snapshot(operation),
        });

        return manager.renderer.rendering;
      },
      start({event, coordinates}: {event: Event; coordinates: Coordinates}) {
        batch(() => {
          activatorEvent.value = event;
          position.reset(coordinates);
        });

        monitor.dispatch('beforedragstart', {operation: snapshot(operation)});

        manager.renderer.rendering.then(() => {
          status.value = Status.Initializing;

          requestAnimationFrame(() => {
            status.value = Status.Dragging;

            monitor.dispatch('dragstart', {operation: snapshot(operation)});
          });
        });
      },
      move({
        by,
        to,
        cancelable = true,
      }:
        | {by: Coordinates; to?: undefined; cancelable?: boolean}
        | {by?: undefined; to: Coordinates; cancelable?: boolean}) {
        if (!dragging.peek()) {
          return;
        }

        let defaultPrevented = false;

        monitor.dispatch('dragmove', {
          operation: snapshot(operation),
          by,
          to,
          cancelable,
          get defaultPrevented() {
            return defaultPrevented;
          },
          preventDefault() {
            if (!cancelable) {
              return;
            }

            defaultPrevented = true;
          },
        });

        if (defaultPrevented) {
          return;
        }

        const coordinates = to ?? {
          x: position.current.x + by.x,
          y: position.current.y + by.y,
        };

        position.update(coordinates);
      },
      stop({canceled = false}: {canceled?: boolean} = {}) {
        let promise: Promise<void> | undefined;
        const suspend = () => {
          const output = {
            resume: () => {},
            abort: () => {},
          };

          promise = new Promise<void>((resolve, reject) => {
            output.resume = resolve;
            output.abort = reject;
          });

          return output;
        };
        const end = () => {
          manager.renderer.rendering.then(() => {
            status.value = Status.Dropping;

            manager.renderer.rendering.then(reset);
          });
        };

        monitor.dispatch('dragend', {
          operation: snapshot(operation),
          canceled,
          suspend,
        });

        if (promise) {
          promise.then(end).catch(reset);
        } else {
          end();
        }
      },
    },
  };
}

function snapshot<T extends Record<string, any>>(obj: T): T {
  return {
    ...obj,
  };
}
