import {signal, untracked, type Signal, effects} from '@dnd-kit/state';
import type {Coordinates} from '@dnd-kit/geometry';

import type {DragDropManager} from '../manager/index.ts';
import type {Draggable, Droppable} from '../entities/index.ts';
import {Plugin} from '../plugins/index.ts';
import type {Collision, CollisionDetector, Collisions} from './types.ts';
import {sortCollisions} from './utilities.ts';

const DEFAULT_VALUE: Collisions = [];

/**
 * Observes and manages collision detection between draggable and droppable elements.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @template V - The type of drag drop manager
 *
 * @remarks
 * The CollisionObserver is responsible for:
 * - Computing collisions between draggable and droppable elements
 * - Maintaining a signal of current collisions
 * - Updating collision state based on drag operation changes
 */
export class CollisionObserver<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
  V extends DragDropManager<T, U> = DragDropManager<T, U>,
> extends Plugin<V> {
  /**
   * Creates a new CollisionObserver instance.
   *
   * @param manager - The drag drop manager instance
   */
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

        if (collisions !== DEFAULT_VALUE) {
          const previousCoordinates = this.#previousCoordinates;
          this.#previousCoordinates = coordinates;

          if (
            previousCoordinates &&
            coordinates.x == previousCoordinates.x &&
            coordinates.y == previousCoordinates.y
          ) {
            return;
          }
        } else {
          this.#previousCoordinates = undefined;
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

  /**
   * Forces an immediate update of collision detection.
   *
   * @param immediate - If true, updates collisions immediately. If false, resets previous coordinates.
   */
  public forceUpdate(immediate = true) {
    untracked(() => {
      if (immediate) {
        this.#collisions.value = this.computeCollisions();
      } else {
        this.#previousCoordinates = undefined;
      }
    });
  }

  /**
   * Computes collisions between draggable and droppable elements.
   *
   * @param entries - Optional array of droppable elements to check. If not provided, uses all registered droppables.
   * @param collisionDetector - Optional custom collision detector function
   * @returns Array of detected collisions, sorted by priority
   */
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
    const potentialTargets = [];

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

      potentialTargets.push(entry);

      // Force collisions to be recomputed when the shape changes
      void entry.shape;

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

    if (potentialTargets.length === 0) {
      return DEFAULT_VALUE;
    }

    collisions.sort(sortCollisions);

    return collisions;
  }

  /**
   * Gets the current collisions signal value.
   */
  public get collisions() {
    return this.#collisions.value;
  }

  #collisions: Signal<Collisions>;
}
