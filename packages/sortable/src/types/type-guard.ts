import type {
  Active,
  Data,
  DroppableContainer,
  DraggableNode,
  Over,
} from '@dnd-kit/core';

import type {SortableData} from './data';

export function hasSortableData<
  T extends Active | Over | DraggableNode | DroppableContainer
>(
  entry: T | null | undefined
): entry is T & {data: {current: Data<SortableData>}} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (
    data &&
    'sortable' in data &&
    typeof data.sortable === 'object' &&
    'containerId' in data.sortable &&
    'items' in data.sortable &&
    'index' in data.sortable
  ) {
    return true;
  }

  return false;
}
