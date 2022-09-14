import {Position} from '@dnd-kit/geometry';
import type {Coordinates} from '@dnd-kit/geometry';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {batch, computed, proxy, reactive} from '@dnd-kit/state';

import type {Draggable, Droppable} from '../nodes';

import type {DragDropRegistry} from './registry';

export enum Status {
  Idle = 'idle',
  Dragging = 'dragging',
  Dropping = 'dropped',
}

export interface Input<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> {
  registry: DragDropRegistry<T, U>;
}

export type DragOperationManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> = ReturnType<typeof DragOperationManager<T, U>>;

class Store<T> {
  private store = proxy<Set<T> | null>(null);

  set value(input: T | T[] | null) {
    const identifiers = normalize(input);
    this.store.value = identifiers ? new Set(identifiers) : null;
  }

  get value(): T[] | null {
    const current = this.store.value;

    return current ? Array.from(current.values()) : null;
  }
}

export interface DragOperation<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> {
  status: Status;
  position: Position;
  active: T[] | null;
  over: U[] | null;
}

export function DragOperationManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
>({registry: {draggable, droppable}}: Input<T, U>) {
  const status = proxy<Status>(Status.Idle);
  const position = new Position({x: 0, y: 0});
  const activeIdentifiers = new Store<UniqueIdentifier>();
  const overIdentifiers = new Store<UniqueIdentifier>();
  const isDragging = () => status.value === Status.Dragging;
  const active = computed(() => {
    const identifiers = activeIdentifiers.value;

    return identifiers ? draggable.pick(...identifiers) : null;
  });
  const over = computed(() => {
    const identifiers = overIdentifiers.value;

    return identifiers ? droppable.pick(...identifiers) : null;
  });

  return {
    operation: {
      get active() {
        return active.value ?? null;
      },
      get over() {
        return over.value ?? null;
      },
      get status() {
        return status.value;
      },
      position,
    },
    actions: {
      start(
        identifiers: UniqueIdentifier | UniqueIdentifier[],
        coordinates: Coordinates
      ) {
        batch(() => {
          status.value = Status.Dragging;
          activeIdentifiers.value = identifiers;
          position.reset(coordinates);
        });
      },
      move(coordinates: Coordinates) {
        if (!isDragging()) {
          return;
        }

        position.update(coordinates);
      },
      over(input: UniqueIdentifier | UniqueIdentifier[] | null) {
        if (!isDragging()) {
          return;
        }

        const identifiers = normalize(input);

        overIdentifiers.value = identifiers;
      },
      cancel() {
        // TO-DO
      },
      stop() {
        if (!isDragging()) {
          return;
        }

        status.value = Status.Dropping;

        requestAnimationFrame(() => {
          batch(() => {
            status.value = Status.Idle;
            activeIdentifiers.value = null;
            overIdentifiers.value = null;
            position.reset({x: 0, y: 0});
          });
        });
      },
    },
  };
}

function normalize<T>(
  input: T
): T extends null ? null : T extends Array<any> ? T : T[];
function normalize<T>(input: T | null): T | T[] | null {
  if (input == null) {
    return null;
  }

  if (Array.isArray(input)) {
    return input;
  }

  return [input];
}
