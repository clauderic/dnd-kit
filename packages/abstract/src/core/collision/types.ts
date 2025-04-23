import type {DragOperation} from '../manager/index.ts';
import type {
  Draggable,
  Droppable,
  UniqueIdentifier,
} from '../entities/index.ts';

/**
 * Priority levels for collision detection.
 *
 * @remarks
 * Higher priority collisions take precedence over lower priority ones.
 * Custom numeric priorities can also be used for fine-grained control.
 */
export enum CollisionPriority {
  /** Lowest priority level */
  Lowest,
  /** Low priority level */
  Low,
  /** Normal priority level */
  Normal,
  /** High priority level */
  High,
  /** Highest priority level */
  Highest,
}

/**
 * Types of collision detection.
 *
 * @remarks
 * Different collision types can be used to implement various
 * drag and drop behaviors and visual feedback.
 */
export enum CollisionType {
  /** Basic collision detection */
  Collision,
  /** Shape-based intersection detection */
  ShapeIntersection,
  /** Pointer-based intersection detection */
  PointerIntersection,
}

/**
 * Represents a detected collision between a draggable and droppable.
 *
 * @remarks
 * Contains information about the collision type, priority, and
 * additional data that can be used for custom behaviors.
 */
export interface Collision {
  /** Unique identifier of the droppable involved in the collision */
  id: UniqueIdentifier;
  /** Priority of the collision */
  priority: CollisionPriority | number;
  /** Type of collision detected */
  type: CollisionType;
  /** Numeric value representing the collision strength or overlap */
  value: number;
  /** Additional data associated with the collision */
  data?: Record<string, any>;
}

/** Array of detected collisions */
export type Collisions = Collision[];

/**
 * Input for collision detection functions.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 */
export interface CollisionDetectorInput<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  /** The droppable to check for collisions */
  droppable: U;
  /** The current drag operation state */
  dragOperation: DragOperation<T, U>;
}

/**
 * Function type for detecting collisions between draggables and droppables.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @param input - The collision detection input
 * @returns A collision object if detected, null otherwise
 */
export type CollisionDetector = <
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
>(
  input: CollisionDetectorInput<T, U>
) => Collision | null;
