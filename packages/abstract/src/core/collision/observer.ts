import {batch, signal, untracked, type Signal, effects} from '@dnd-kit/state';
import type {Coordinates} from '@dnd-kit/geometry';

import type {DragDropManager} from '../manager/index.ts';
import type {Draggable, Droppable} from '../entities/index.ts';
import {Plugin} from '../plugins/index.ts';
import type {Collision, CollisionDetector, Collisions} from './types.ts';
import {sortCollisions} from './utilities.ts';

const DEFAULT_VALUE: Collisions = [];

export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> extends Plugin<V> {
  constructor(manager: V) {
    super(manager);

    this.computeCollisions = this.computeCollisions.bind(this);
    this.#collisions = signal(DEFAULT_VALUE);

    let previousCoordinates: Coordinates = {x: 0, y: 0};

    this.destroy = effects(
      () => {
        const collisions = this.computeCollisions();

        const coordinates = untracked(
          () => this.manager.dragOperation.position.current
        );
        const {x, y} = previousCoordinates;

        previousCoordinates = coordinates;

        if (coordinates.x == x && coordinates.y == y) {
          return;
        }

        this.#collisions.value = collisions;
      },
      () => {
        const {dragOperation} = this.manager;

        if (dragOperation.status.initialized) {
          this.forceUpdate();
        }
      }
    );
  }

  forceUpdateCount = signal(0);

  public forceUpdate(refresh = true) {
    untracked(() => {
      const {source} = this.manager.dragOperation;

      batch(() => {
        if (refresh) {
          for (const droppable of this.manager.registry.droppables) {
            if (source && !droppable.accepts(source)) {
              continue;
            }

            droppable.refreshShape();
          }
        }

        this.#collisions.value = this.computeCollisions();
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

    const collisions: Collision[] = [];

    for (const entry of entries ?? registry.droppables) {
      if (entry.disabled) {
        continue;
      }

      if (source && !entry.accepts(source)) {
        continue;
      }

      const detectCollision = collisionDetector ?? entry.collisionDetector;

      if (!detectCollision) {
        continue;
      }

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

  #collisions: Signal<Collisions>;
}
