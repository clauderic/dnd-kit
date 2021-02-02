import {arrayMove} from '@dnd-kit/sortable';

import type {FlattenedItem, TreeItem, TreeItems} from './types';

function getDragDepth(offset: number, step) {
  return Math.round(offset / step);
}

export function getProjectedDepth(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  step: number
) {
  const overItemIndex = items.findIndex(({id}) => id === overId);
  const activeItemIndex = items.findIndex(({id}) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, step);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({nextItem});

  if (projectedDepth >= maxDepth) {
    return {depth: maxDepth, maxDepth, minDepth};
  }

  if (projectedDepth < minDepth) {
    return {depth: minDepth, maxDepth, minDepth};
  }

  return {depth: projectedDepth, maxDepth, minDepth};
}

function getMaxDepth({previousItem}: {previousItem: FlattenedItem}) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({nextItem}: {nextItem: FlattenedItem}) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

export function flattenTree(items: TreeItems) {
  const flattened = [];

  items.forEach((item, index) => {
    flattened.push({...item, parentId: null, depth: 0, index});

    if (item.children.length) {
      item.children.forEach((child, index) => {
        flattened.push({...child, depth: 1, parentId: item.id, index});
      });
    }
  });

  return flattened;
}

export function insertNodeAtDepthAndIndex(
  _items: TreeItems,
  _depth: number,
  _index: number,
  _item: TreeItem,
  _maxDepth: number
) {
  // To-do: not implemented
}
