import {Position, type Shape} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {batch, computed, signal} from '@dnd-kit/state';

import type {Draggable, Droppable} from '../nodes';

import type {DragDropRegistry} from './registry';
import type {DragDropMonitor} from './manager';

export enum Status {
  Idle = 'idle',
  Dragging = 'dragging',
  Dropping = 'dropped',
}

export interface Input<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  registry: DragDropRegistry<T, U>;
  monitor: DragDropMonitor;
}

export type DragOperationManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> = ReturnType<typeof DragOperationManager<T, U>>;

export type Serializable = {
  [key: string]: string | number | null | Serializable | Serializable[];
};

export interface DragOperation<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  status: Status;
  position: Position;
  initialized: boolean;
  shape: Shape | null;
  source: T | null;
  target: U | null;
  data?: Serializable;
}

export function DragOperationManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
>({registry: {draggable, droppable}, monitor}: Input<T, U>) {
  const status = signal<Status>(Status.Idle);
  const shape = signal<Shape | null>(null);
  const position = new Position({x: 0, y: 0});
  const sourceIdentifier = signal<UniqueIdentifier | null>(null);
  const targetIdentifier = signal<UniqueIdentifier | null>(null);
  const source = computed(() => {
    const identifier = sourceIdentifier.value;
    return identifier ? draggable.get(identifier) : null;
  });
  const target = computed(() => {
    const identifier = targetIdentifier.value;
    return identifier ? droppable.get(identifier) : null;
  });
  const dragging = computed(() => status.value === Status.Dragging);

  const operation: DragOperation<T, U> = {
    get source() {
      return source.value ?? null;
    },
    get target() {
      return target.value ?? null;
    },
    get status() {
      return status.value;
    },
    get initialized() {
      return status.value !== Status.Idle;
    },
    get shape() {
      return shape.value;
    },
    set shape(value: Shape | null) {
      shape.value = value;
    },
    position,
  };

  return {
    operation,
    actions: {
      setDragSource(identifier: UniqueIdentifier) {
        sourceIdentifier.value = identifier;
      },
      setDropTarget(identifier: UniqueIdentifier | null) {
        if (!dragging.peek()) {
          return;
        }

        targetIdentifier.value = identifier;
      },
      start(coordinates: Coordinates) {
        batch(() => {
          status.value = Status.Dragging;
          position.reset(coordinates);
        });

        monitor.dispatch('dragstart', {});
      },
      move(coordinates: Coordinates) {
        if (!dragging.peek()) {
          return;
        }

        position.update(coordinates);

        monitor.dispatch('dragmove', {});
      },
      cancel() {
        // TO-DO
        monitor.dispatch('dragend', {
          operation: snapshot(operation),
          canceled: true,
        });
      },
      stop() {
        status.value = Status.Dropping;

        monitor.dispatch('dragend', {
          operation: snapshot(operation),
          canceled: false,
        });

        requestAnimationFrame(() => {
          batch(() => {
            status.value = Status.Idle;
            sourceIdentifier.value = null;
            targetIdentifier.value = null;
            position.reset({x: 0, y: 0});
          });
        });
      },
    },
  };
}

function snapshot<T extends Record<string, any>>(obj: T): T {
  return {
    ...obj,
  };
}
