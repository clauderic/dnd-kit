import {signal, untracked, type Signal, effect} from '@dnd-kit/state';

import type {DragDropManager} from '../manager/index.ts';
import type {Draggable, Droppable} from '../entities/index.ts';
import {Plugin} from '../plugins/index.ts';
import type {Collision, CollisionDetector, Collisions} from './types.ts';
import {sortCollisions} from './utilities.ts';
import {collisionState} from './state.ts';

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

    const state = collisionState(manager);
    const dispose = effect(() => {
      const {dragOperation, registry} = manager;
      const {source, shape, status} = dragOperation;
      const position = dragOperation.position.current;
      const transform = dragOperation.transform;

      if (
        position !== state.position ||
        transform.x !== state.transform?.x ||
        transform.y !== state.transform?.y
      ) {
        state.input++;
        state.position = position;
        state.transform = transform;
      }

      if (status.initialized && shape) {
        // Subscribe without running user detectors. Computation runs once after
        // the reactive batch, when feedback and all changed rectangles agree.
        // The registry's default iterator intentionally does not subscribe.
        for (const entry of registry.droppables.value) {
          void entry.id;
          if (entry.disabled || (source && !entry.accepts(source))) continue;
          void entry.collisionDetector;
          void entry.collisionPriority;
          void entry.shape;
        }
      }

      this.#invalidate();
    });

    this.destroy = () => {
      this.#destroyed = true;
      dispose();
      state.reset();
    };
  }

  #destroyed = false;
  #scheduled = false;

  #invalidate() {
    const state = collisionState(this.manager);
    state.dirty = true;
    if (this.#scheduled || this.#destroyed) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      if (state.dirty && !this.#destroyed) this.forceUpdate();
    });
  }

  /**
   * Forces an immediate update of collision detection.
   *
   * @param immediate - If true, updates synchronously. Otherwise coalesces an update at the end of the current turn.
   */
  public forceUpdate(immediate = true) {
    untracked(() => {
      if (this.#destroyed) return;
      if (immediate) {
        collisionState(this.manager).dirty = false;
        this.#collisions.value = this.computeCollisions();
      } else {
        this.#invalidate();
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

    for (const entry of entries ?? registry.droppables.value) {
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
