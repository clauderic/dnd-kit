import {computed, ReadonlySignal} from '@dnd-kit/state';
import {isEqual} from '@dnd-kit/utilities';

import type {DragDropManager} from '../manager';
import type {Draggable, Droppable} from '../nodes';
import {Plugin} from '../plugins';
import type {Collision, CollisionDetector, Collisions} from './types';
import {sortCollisions} from './utilities';

const DEFAULT_VALUE: Collisions = [];

export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> extends Plugin<V> {
  constructor(manager: V) {
    super(manager);

    this.computeCollisions = this.computeCollisions.bind(this);
    this.__computedCollisions = computed(this.computeCollisions, isEqual);
  }

  public computeCollisions(
    entries?: Droppable[],
    collisionDetector?: CollisionDetector
  ) {
    const {registry, dragOperation} = this.manager;
    const {source, shape, initialized} = dragOperation;

    if (!initialized || !shape) {
      return DEFAULT_VALUE;
    }

    const type = source?.type;
    const collisions: Collision[] = [];

    for (const entry of entries ?? registry.droppable) {
      if (entry.disabled) {
        continue;
      }

      if (type != null && !entry.accepts(type)) {
        continue;
      }

      const detectCollision = collisionDetector ?? entry.collisionDetector;
      const collision = detectCollision({
        droppable: entry,
        dragOperation,
      });

      if (collision) {
        collisions.push(collision);
      }
    }

    collisions.sort(sortCollisions);

    return collisions;
  }

  public get collisions() {
    return this.__computedCollisions.value;
  }

  private __computedCollisions: ReadonlySignal<Collisions>;
}
