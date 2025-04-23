import type {DragDropManager} from './manager.ts';

/**
 * Infers the draggable type from a drag and drop manager type.
 *
 * @template P - The drag and drop manager type
 * @returns The inferred draggable type
 *
 * @example
 * ```typescript
 * type MyDraggable = InferDraggable<DragDropManager<HTMLDivElement, HTMLDivElement>>;
 * // MyDraggable is HTMLDivElement
 * ```
 */
export type InferDraggable<P> =
  P extends DragDropManager<infer T, any> ? T : never;

/**
 * Infers the droppable type from a drag and drop manager type.
 *
 * @template P - The drag and drop manager type
 * @returns The inferred droppable type
 *
 * @example
 * ```typescript
 * type MyDroppable = InferDroppable<DragDropManager<HTMLDivElement, HTMLDivElement>>;
 * // MyDroppable is HTMLDivElement
 * ```
 */
export type InferDroppable<P> =
  P extends DragDropManager<any, infer T> ? T : never;
