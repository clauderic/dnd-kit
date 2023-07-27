import {computed, ReadonlySignal} from '@dnd-kit/state';
import {isEqual} from '@dnd-kit/utilities';

import type {DragOperation, DragDropRegistry} from '../manager';
import type {Draggable, Droppable} from '../nodes';
import type {Collision, Collisions} from './types';
import {sortCollisions} from './utilities';

export type Input<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> = {
  dragOperation: DragOperation<T, U>;
  registry: DragDropRegistry<T, U>;
};

export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  constructor({registry, dragOperation}: Input<T, U>) {
    this.__computedCollisions = computed(() => {
      const {source, shape, initialized} = dragOperation;

      if (!initialized || !shape) {
        return null;
      }

      const type = source?.type;
      const collisions: Collision[] = [];

      for (const entry of registry.droppable) {
        if (entry.disabled) {
          continue;
        }

        if (type != null && !entry.accepts(type)) {
          continue;
        }

        const {collisionDetector} = entry;
        const collision = collisionDetector({
          droppable: entry,
          dragOperation,
        });

        if (collision) {
          collisions.push(collision);
        }
      }

      collisions.sort(sortCollisions);

      return collisions;
    }, isEqual);
  }

  public get collisions() {
    return this.__computedCollisions.value;
  }

  private __computedCollisions: ReadonlySignal<Collisions>;
}
