import type {DragOperation} from '@dnd-kit/abstract';
import type {Droppable, Draggable} from '@dnd-kit/dom';

import {SortableDroppable, SortableDraggable} from './sortable.ts';

export function isSortable(
  element: Draggable | Droppable | null
): element is SortableDroppable<any> | SortableDraggable<any> {
  return (
    element instanceof SortableDroppable || element instanceof SortableDraggable
  );
}

export function isSortableOperation(
  operation: DragOperation<Draggable, Droppable>
): operation is DragOperation<SortableDraggable<any>, SortableDroppable<any>> {
  return isSortable(operation.source) && isSortable(operation.target);
}
