import {arrayMove} from '@dnd-kit/sortable';

import type {FlattenedItem, TreeItem, TreeItems} from './types';

function getDragDepth(offset: number, step) {
  return Math.round(offset / step);
}

export function getProjection(
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
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return {depth, maxDepth, minDepth, parentId: getParentId()};

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
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

function flatten(
  items: TreeItems,
  parentId = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce((acc, item, index) => {
    return [
      ...acc,
      {...item, parentId, depth, index},
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: TreeItems) {
  return flatten(items);
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root = {id: null, children: []};
  const node_list = {null: root};
  // Start with empty children
  const items = flattenedItems.map((item) => ({...item, children: []}));

  for (const item of items) {
    const {id, children, parentId} = item;

    node_list[id] = {id, children};

    const parent =
      node_list[parentId] ?? items.find((item) => item.id === parentId);

    parent.children.push(item);
  }

  return root.children;
}

export function findTreeItem(items: TreeItem[], itemId) {
  return items.find(({id}) => id === itemId);
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
