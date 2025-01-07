import {Position, type Shape} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import {
  batch,
  computed,
  deepEqual,
  effect,
  signal,
  untracked,
} from '@dnd-kit/state';

import {Draggable, Droppable, UniqueIdentifier} from '../entities/index.ts';
import type {Modifier} from '../modifiers/index.ts';
import {descriptor} from '../plugins/index.ts';

import type {DragDropManager} from './manager.ts';
import {defaultPreventable} from './events.ts';

export enum Status {
  Idle = 'idle',
  Initializing = 'initializing',
  Dragging = 'dragging',
  Dropped = 'dropped',
}

export type Serializable = {
  [key: string]: string | number | null | Serializable | Serializable[];
};

export interface DragOperation<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  activatorEvent: Event | null;
  canceled: boolean;
  position: Position;
  transform: Coordinates;
  status: {
    current: Status;
    initialized: boolean;
    initializing: boolean;
    dragging: boolean;
    dragended: boolean;
    dropped: boolean;
    idle: boolean;
  };
  get shape(): {
    initial: Shape;
    current: Shape;
  } | null;
  set shape(value: Shape | null);
  source: T | null;
  target: U | null;
  data?: Serializable;
}

export type DragActions<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> = ReturnType<typeof DragOperationManager<T, U, V>>['actions'];

export const DraggableFileSymbol = Symbol();

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
  const shape = {
    initial: signal<Shape | null>(null),
    current: signal<Shape | null>(null),
  };
  const canceled = signal<boolean>(false);
  const position = new Position({x: 0, y: 0});
  const activatorEvent = signal<Event | null>(null);
  const sourceIdentifier = signal<UniqueIdentifier | null>(null);
  const targetIdentifier = signal<UniqueIdentifier | null>(null);
  const dragging = computed(() => status.value === Status.Dragging);
  const initialized = computed(() => status.value !== Status.Idle);
  const initializing = computed(() => status.value === Status.Initializing);
  const idle = computed(() => status.value === Status.Idle);
  const dropped = computed(() => status.value === Status.Dropped);
  const dragended = signal<boolean>(true);
  let previousSource: T | undefined;
  const draggableFile = new Draggable(
    {id: DraggableFileSymbol},
    manager
  ) as unknown as T;
  const source = computed<T | null>(() => {
    const identifier = sourceIdentifier.value;

    if (identifier == null) return null;

    let value = draggables.get(identifier);
    if (identifier === DraggableFileSymbol) {
      value = draggableFile;
    }

    if (value) {
      // It's possible for the source to unmount during the drag operation
      previousSource = value;
    }

    return value ?? previousSource ?? null;
  });
  const target = computed<U | null>(() => {
    const identifier = targetIdentifier.value;
    return identifier != null ? (droppables.get(identifier) ?? null) : null;
  });

  const modifiers = signal<Modifier[]>([]);

  const dispose = effect(() => {
    const currentModifiers = modifiers.peek();

    if (!deepEqual(currentModifiers, manager.modifiers)) {
      currentModifiers.forEach((modifier) => modifier.destroy());
    }

    modifiers.value =
      source.value?.modifiers?.map((modifier) => {
        const {plugin, options} = descriptor(modifier);
        return new plugin(manager, options);
      }) ?? manager.modifiers;
  });

  const transform = computed(() => {
    const {x, y} = position.delta;

    let transform = {x, y};
    const initialShape = shape.initial.value;
    const currentShape = shape.current.peek();
    const operation: Omit<DragOperation<T, U>, 'transform'> = {
      activatorEvent: activatorEvent.peek(),
      canceled: canceled.peek(),
      source: source.peek(),
      target: target.peek(),
      status: {
        current: status.peek(),
        idle: idle.peek(),
        initializing: initializing.peek(),
        initialized: initialized.peek(),
        dragging: dragging.peek(),
        dragended: dragended.peek(),
        dropped: dropped.peek(),
      },
      shape:
        initialShape && currentShape
          ? {initial: initialShape, current: currentShape}
          : null,
      position,
    };

    for (const modifier of modifiers.value) {
      transform = modifier.apply({...operation, transform});
    }

    return transform;
  });

  const operation: DragOperation<T, U> = {
    get activatorEvent() {
      return activatorEvent.value;
    },
    get canceled() {
      return canceled.value;
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
      get dragended() {
        return dragended.value;
      },
      get dropped() {
        return dropped.value;
      },
    },
    get shape(): DragOperation['shape'] {
      const initial = shape.initial.value;
      const current = shape.current.value;

      return initial && current ? {initial, current} : null;
    },
    set shape(value: Shape | null) {
      if (value && shape.current.peek()?.equals(value)) {
        return;
      }

      const initial = shape.initial.peek();

      if (!initial) {
        shape.initial.value = value;
      }

      shape.current.value = value;
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
      shape.current.value = null;
      shape.initial.value = null;
      position.reset({x: 0, y: 0});
      modifiers.value = [];
    });
  };

  const actions = {
    setDragSource(identifier: UniqueIdentifier) {
      sourceIdentifier.value = identifier;
    },
    setDropTarget(
      identifier: UniqueIdentifier | null | undefined
    ): Promise<boolean> {
      const id = identifier ?? null;

      if (targetIdentifier.peek() === id) {
        return Promise.resolve(false);
      }

      targetIdentifier.value = id;

      const event = defaultPreventable({
        operation: snapshot(operation),
      });

      if (status.peek() === Status.Dragging) {
        monitor.dispatch('dragover', event);
      }

      return manager.renderer.rendering.then(() => event.defaultPrevented);
    },
    start({
      event: nativeEvent,
      coordinates,
    }: {
      event?: Event;
      coordinates: Coordinates;
    }) {
      const sourceInstance = source.peek();

      if (!sourceInstance) {
        throw new Error('Cannot start a drag operation without a drag source');
      }

      batch(() => {
        shape.initial.value = null;
        shape.current.value = null;
        dragended.value = false;
        canceled.value = false;
        activatorEvent.value = nativeEvent ?? null;
        position.reset(coordinates);
      });

      const beforeStartEvent = defaultPreventable({
        operation: snapshot(operation),
      });

      monitor.dispatch('beforedragstart', beforeStartEvent);

      manager.renderer.rendering.then(() => {
        if (beforeStartEvent.defaultPrevented) {
          reset();
          return;
        }

        status.value = Status.Initializing;

        requestAnimationFrame(() => {
          status.value = Status.Dragging;

          monitor.dispatch('dragstart', {
            nativeEvent,
            operation: snapshot(operation),
            cancelable: false,
          });
        });
      });
    },
    move({
      by,
      to,
      event: nativeEvent,
      cancelable = true,
      propagate = true,
    }:
      | {
          by: Coordinates;
          to?: undefined;
          event?: Event;
          cancelable?: boolean;
          propagate?: boolean;
        }
      | {
          by?: undefined;
          to: Coordinates;
          event?: Event;
          cancelable?: boolean;
          propagate?: boolean;
        }) {
      if (!dragging.peek()) {
        return;
      }

      const event = defaultPreventable(
        {
          nativeEvent,
          operation: snapshot(operation),
          by,
          to,
        },
        cancelable
      );

      if (propagate) {
        monitor.dispatch('dragmove', event);
      }

      queueMicrotask(() => {
        if (event.defaultPrevented) {
          return;
        }

        const coordinates = to ?? {
          x: position.current.x + by.x,
          y: position.current.y + by.y,
        };

        position.update(coordinates);
      });
    },
    stop({
      canceled: eventCanceled = false,
      event: nativeEvent,
    }: {event?: Event; canceled?: boolean} = {}) {
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
        /* Wait for the renderer to finish rendering before finalizing the drag operation */
        manager.renderer.rendering.then(() => {
          status.value = Status.Dropped;

          const dropping = untracked(() => source.value?.status === 'dropping');

          if (dropping) {
            const currentSource = source.value;

            // Wait until the source has finished dropping before resetting the operation
            const dispose = effect(() => {
              if (currentSource?.status === 'idle') {
                dispose();

                // Only reset the drag operation if the source is still the same source that was active when the drag operation
                // was ended, as it's possible for a new drag operation to start while the previous source is still dropping
                if (source.value !== currentSource) return;

                reset();
              }
            });
          } else {
            manager.renderer.rendering.then(reset);
          }
        });
      };

      batch(() => {
        dragended.value = true;
        canceled.value = eventCanceled;
      });

      monitor.dispatch('dragend', {
        nativeEvent,
        operation: snapshot(operation),
        canceled: eventCanceled,
        suspend,
      });

      if (promise) {
        promise.then(end).catch(reset);
      } else {
        end();
      }
    },
  };

  return {
    operation,
    actions,
    cleanup() {
      if (status.peek() !== Status.Idle) {
        actions.stop({canceled: true});
      }

      modifiers.value.forEach((modifier) => modifier.destroy());
      dispose();
    },
  };
}

function snapshot<T extends Record<string, any>>(obj: T): T {
  return {
    ...obj,
  };
}
