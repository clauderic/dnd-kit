import {ShapeGroup} from '@dnd-kit/geometry';
import {computed, ReadonlyProxyState} from '@dnd-kit/state';
import {isEqual} from '@dnd-kit/utilities';

import type {DragOperation, DragDropRegistry} from '../manager';
import type {Draggable, Droppable} from '../nodes';
import type {Collision, Collisions} from './types';
import {sortCollisions} from './utilities';

export type Input<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> = {
  dragOperation: DragOperation<T, U>;
  registry: DragDropRegistry<T, U>;
};

export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable
> {
  constructor({registry, dragOperation}: Input<T, U>) {
    this._computed = computed(() => {
      const {active, position} = dragOperation;
      const pointerCoordinates = position.current;

      if (!active?.length) {
        return null;
      }

      const shapes = pick(active, 'shape');
      const types = pick(active, 'type');
      const shape = new ShapeGroup(...shapes);
      const collisions: Collision[] = [];

      for (const droppable of registry.droppable) {
        if (droppable.disabled) {
          continue;
        }

        if (!droppable.compatibleWith(types)) {
          continue;
        }

        const {collisionDetector} = droppable;
        const collision = collisionDetector({
          shape,
          droppable,
          dragOperation,
          pointerCoordinates,
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
    return this._computed.value;
  }

  private _computed: ReadonlyProxyState<Collisions>;
}

function pick<T extends Object, U extends keyof T>(objects: T[], key: U) {
  return objects.reduce<NonNullable<T[U]>[]>((accumulator, entry) => {
    const value = entry[key];

    if (value != null) {
      accumulator.push(value);
    }

    return accumulator;
  }, []);
}
