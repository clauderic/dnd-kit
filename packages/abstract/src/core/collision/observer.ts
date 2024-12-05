import {signal, untracked, type Signal, effects} from '@dnd-kit/state';
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

    this.destroy = effects(
      () => {
        const collisions = this.computeCollisions();
        const coordinates = untracked(
          () => this.manager.dragOperation.position.current
        );
        const previousCoordinates = this.#previousCoordinates;

        this.#previousCoordinates = coordinates;

        if (
          previousCoordinates &&
          coordinates.x == previousCoordinates.x &&
          coordinates.y == previousCoordinates.y
        ) {
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

  #previousCoordinates: Coordinates | undefined;

  public forceUpdate(immediate = true) {
    untracked(() => {
      if (immediate) {
        this.#collisions.value = this.computeCollisions();
      } else {
        this.#previousCoordinates = undefined;
      }
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

    const collisionMap: Map<Droppable, Collision> = new Map();

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

        collisionMap.set(entry, collision);
      }
    }

    // Filter out collisions of items that contain other items
    const collisions = Array.from(collisionMap.entries())
      .filter(([droppable]) => {
        if (source && droppable.path.indexOf(source.id) !== -1) {
          // Dragged item is parent of collision target. Filter out collision
          return false;
        }

        return true;
      })
      .map(([_, collision]) => collision);

    collisions.sort(sortCollisions);

    return collisions;
  }

  public get collisions() {
    return this.#collisions.value;
  }

  #collisions: Signal<Collisions>;
}
