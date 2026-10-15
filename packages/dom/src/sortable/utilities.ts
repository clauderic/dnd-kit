import type {Data, DragOperation} from '@dnd-kit/abstract';
import type {Droppable, Draggable} from '@dnd-kit/dom';

import {SortableDroppable, SortableDraggable} from './sortable.ts';

export function isSortable<T extends Data = Data>(
  element: Draggable<T> | null
): element is SortableDraggable<T>;
export function isSortable<T extends Data = Data>(
  element: Droppable<T> | null
): element is SortableDroppable<T>;
export function isSortable<T extends Data = Data>(
  element: Draggable<T> | Droppable<T> | null
): element is SortableDroppable<T> | SortableDraggable<T> {
  return (
    element instanceof SortableDroppable || element instanceof SortableDraggable
  );
}

export function isSortableOperation<T extends Data = Data, U extends Data = T>(
  operation: DragOperation<Draggable<T>, Droppable<U>>
): operation is DragOperation<SortableDraggable<T>, SortableDroppable<U>> {
  return isSortable(operation.source) && isSortable(operation.target);
}
