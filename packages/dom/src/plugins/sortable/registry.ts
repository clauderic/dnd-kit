import type {Droppable, Draggable} from '../../nodes';

export const SortableRegistry = new WeakSet<Draggable | Droppable>();

export function isSortable(element: Draggable | Droppable | null): boolean {
  return element ? SortableRegistry.has(element) : false;
}
