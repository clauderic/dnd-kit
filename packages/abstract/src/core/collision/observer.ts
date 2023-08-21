import {
  batch,
  computed,
  deepEqual,
  signal,
  untracked,
  type ReadonlySignal,
  effect,
} from '@dnd-kit/state';

import type {DragDropManager} from '../manager/index.js';
import type {Draggable, Droppable} from '../nodes/index.js';
import {Plugin} from '../plugins/index.js';
import type {Collision, CollisionDetector, Collisions} from './types.js';
import {sortCollisions} from './utilities.js';

const DEFAULT_VALUE: Collisions = [];

export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> extends Plugin<V> {
  constructor(manager: V) {
    super(manager);

    this.computeCollisions = this.computeCollisions.bind(this);
    this.#collisions = computed(this.computeCollisions, deepEqual);

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;

      if (dragOperation.status.initialized) {
        this.forceUpdate();
      }
    });
  }

  forceUpdateCount = signal(0);

  public forceUpdate(refresh = true) {
    untracked(() => {
      const type = this.manager.dragOperation.source?.type;

      batch(() => {
        if (refresh) {
          for (const droppable of this.manager.registry.droppables) {
            if (type != null && !droppable.accepts(type)) {
              continue;
            }

            droppable.refreshShape();
          }
        }

        this.forceUpdateCount.value++;
      });
    });
  }

  public computeCollisions(
    entries?: Droppable[],
    collisionDetector?: CollisionDetector
  ) {
    const {registry, dragOperation} = this.manager;
    const {source, shape, status} = dragOperation;

    if (!status.initialized || !shape) {
      return DEFAULT_VALUE;
    }

    const type = source?.type;
    const collisions: Collision[] = [];

    this.forceUpdateCount.value;

    for (const entry of entries ?? registry.droppables) {
      if (entry.disabled) {
        continue;
      }

      if (type != null && !entry.accepts(type)) {
        continue;
      }

      const detectCollision = collisionDetector ?? entry.collisionDetector;
      const collision = untracked(() =>
        detectCollision({
          droppable: entry,
          dragOperation,
        })
      );

      if (collision) {
        if (entry.collisionPriority != null) {
          collision.priority = entry.collisionPriority;
        }

        collisions.push(collision);
      }
    }

    collisions.sort(sortCollisions);

    return collisions;
  }

  public get collisions() {
    return this.#collisions.value;
  }

  #collisions: ReadonlySignal<Collisions>;
}
