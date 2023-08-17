import type {Droppable, Draggable} from '../../nodes';

import {SortableDroppable, SortableDraggable} from './sortable';

export function isSortable(element: Draggable | Droppable | null): boolean {
  return (
    element instanceof SortableDroppable || element instanceof SortableDraggable
  );
}
