import type {Droppable, Draggable} from '@dnd-kit/dom';

import {SortableDroppable, SortableDraggable} from './sortable.js';

export function isSortable(element: Draggable | Droppable | null): boolean {
  return (
    element instanceof SortableDroppable || element instanceof SortableDraggable
  );
}
