import {derived, effects, reactive, type Effect} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import {
  CollisionPriority,
  type CollisionDetector,
} from '../../collision/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import {Draggable} from '../draggable/draggable.ts';

/**
 * Input configuration for creating a droppable entity.
 *
 * @template T - The type of data associated with the droppable
 *
 * @remarks
 * Extends the base entity input with droppable-specific configuration:
 * - Accept rules for determining compatible draggables
 * - Collision detection configuration
 * - Type for categorization
 */
export interface Input<T extends Data = Data> extends EntityInput<T> {
  /** Types of draggables that can be dropped here, or a function to determine compatibility */
  accept?: Type | Type[] | ((source: Draggable) => boolean);
  /** Priority for collision detection */
  collisionPriority?: CollisionPriority | number;
  /** Detector for determining collisions with draggables */
  collisionDetector: CollisionDetector;
  /** Type for categorization */
  type?: Type;
}

/**
 * Represents an entity that can receive draggable items in a drag and drop operation.
 *
 * @template T - The type of data associated with the droppable
 * @template U - The type of drag and drop manager
 *
 * @remarks
 * This class extends the base Entity class with droppable-specific functionality:
 * - Type-based acceptance rules
 * - Collision detection
 * - Shape tracking
 * - Target status tracking
 */
export class Droppable<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Entity<T, U> {
  constructor(
    {accept, collisionDetector, collisionPriority, type, ...input}: Input<T>,
    manager: U | undefined
  ) {
    super(input, manager);

    this.accept = accept;
    this.collisionDetector = collisionDetector;
    this.collisionPriority = collisionPriority;
    this.type = type;
  }

  /**
   * Types of draggables that can be dropped here, or a function to determine compatibility.
   *
   * @remarks
   * If undefined, all draggables are accepted.
   * If a function, it determines compatibility based on the draggable.
   * If a type or array of types, only draggables of matching types are accepted.
   */
  @reactive
  public accessor accept:
    | Type
    | Type[]
    | ((draggable: Draggable) => boolean)
    | undefined;

  /** The type of the droppable entity */
  @reactive
  public accessor type: Type | undefined;

  /**
   * Checks whether or not the droppable accepts a given draggable.
   *
   * @param draggable - The draggable to check
   * @returns true if the draggable can be dropped here
   */
  public accepts(draggable: Draggable): boolean {
    const {accept} = this;

    if (!accept) {
      return true;
    }

    if (typeof accept === 'function') {
      return accept(draggable);
    }

    if (!draggable.type) {
      return false;
    }

    if (Array.isArray(accept)) {
      return accept.includes(draggable.type);
    }

    return draggable.type === accept;
  }

  /** The collision detector for this droppable */
  @reactive
  public accessor collisionDetector: CollisionDetector;

  /** The collision priority for this droppable */
  @reactive
  public accessor collisionPriority: CollisionPriority | number | undefined;

  /** The current shape of this droppable */
  @reactive
  public accessor shape: Shape | undefined;

  /**
   * Checks if this droppable is the current drop target.
   *
   * @returns true if this droppable's ID matches the current drag operation's target ID
   */
  @derived
  public get isDropTarget() {
    return this.manager?.dragOperation.target?.id === this.id;
  }
}
