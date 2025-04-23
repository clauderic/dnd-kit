/**
 * Type representing arbitrary data associated with an entity.
 *
 * @remarks
 * This type is used to store additional information about entities
 * that can be accessed during drag and drop operations.
 */
export type Data = Record<string, any>;

/**
 * Type representing a unique identifier for an entity.
 *
 * @remarks
 * This type is used to uniquely identify draggable and droppable entities
 * within the drag and drop system.
 */
export type UniqueIdentifier = string | number;

/**
 * Type representing the type of an entity.
 *
 * @remarks
 * This type is used to categorize entities and can be used to
 * implement type-based filtering or matching.
 */
export type Type = Symbol | string | number;
