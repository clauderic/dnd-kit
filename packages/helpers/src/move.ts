import type {
  UniqueIdentifier,
  Draggable,
  Droppable,
  DragDropManager,
  DragDropEvents,
} from '@dnd-kit/abstract';

/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arrayMove<T extends any[]>(
  array: T,
  from: number,
  to: number
): T {
  if (from === to) {
    return array;
  }

  const newArray = array.slice() as T;
  newArray.splice(to, 0, newArray.splice(from, 1)[0]);

  return newArray;
}

/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arraySwap<T extends any[]>(
  array: T,
  from: number,
  to: number
): T {
  if (from === to) {
    return array;
  }

  const newArray = array.slice() as T;
  const item = newArray[from];

  newArray[from] = newArray[to];
  newArray[to] = item;

  return newArray;
}

type Items = UniqueIdentifier[] | {id: UniqueIdentifier}[];

function mutate<
  T extends Items | Record<UniqueIdentifier, Items>,
  U extends Draggable,
  V extends Droppable,
  W extends DragDropManager<U, V>,
>(
  items: T,
  event: Parameters<
    DragDropEvents<U, V, W>['dragover'] | DragDropEvents<U, V, W>['dragend']
  >[0],
  mutation: typeof arrayMove | typeof arraySwap
): T {
  const {source, target, canceled} = event.operation;

  if (!source || !target || canceled) {
    if ('preventDefault' in event) event.preventDefault();
    return items;
  }

  const findIndex = (item: Items[0], id: UniqueIdentifier) =>
    item === id || (typeof item === 'object' && 'id' in item && item.id === id);

  if (Array.isArray(items)) {
    const sourceIndex = items.findIndex((item) => findIndex(item, source.id));
    const targetIndex = items.findIndex((item) => findIndex(item, target.id));

    if (sourceIndex === -1 || targetIndex === -1) {
      return items;
    }

    // Reconcile optimistic updates
    if (!canceled && 'index' in source && typeof source.index === 'number') {
      const projectedSourceIndex = source.index;

      if (projectedSourceIndex !== sourceIndex) {
        return mutation(items, sourceIndex, projectedSourceIndex);
      }
    }

    return mutation(items, sourceIndex, targetIndex);
  }

  const entries = Object.entries(items);

  let sourceIndex = -1;
  let sourceParent: UniqueIdentifier | undefined;
  let targetIndex = -1;
  let targetParent: UniqueIdentifier | undefined;

  for (const [id, children] of entries) {
    if (sourceIndex === -1) {
      sourceIndex = children.findIndex((item) => findIndex(item, source.id));

      if (sourceIndex !== -1) {
        sourceParent = id;
      }
    }

    if (targetIndex === -1) {
      targetIndex = children.findIndex((item) => findIndex(item, target.id));

      if (targetIndex !== -1) {
        targetParent = id;
      }
    }

    if (sourceIndex !== -1 && targetIndex !== -1) {
      break;
    }
  }

  if (!source.manager) return items;

  const {dragOperation} = source.manager;
  const position =
    dragOperation.shape?.current.center ?? dragOperation.position.current;

  if (targetParent == null) {
    if (target.id in items) {
      const insertionIndex =
        target.shape && position.y > target.shape.center.y
          ? items[target.id].length
          : 0;

      // The target does not have any matching children, but appears to be a valid target
      targetParent = target.id;
      targetIndex = insertionIndex;
    }
  }

  if (
    sourceParent == null ||
    targetParent == null ||
    (sourceParent === targetParent && sourceIndex === targetIndex)
  ) {
    if ('preventDefault' in event) event.preventDefault();

    return items;
  }

  if (sourceParent === targetParent) {
    return {
      ...items,
      [sourceParent]: mutation(items[sourceParent], sourceIndex, targetIndex),
    };
  }

  const isBelowTarget =
    target.shape && Math.round(position.y) > Math.round(target.shape.center.y);
  const modifier = isBelowTarget ? 1 : 0;
  const sourceItem = items[sourceParent][sourceIndex];

  return {
    ...items,
    [sourceParent]: [
      ...items[sourceParent].slice(0, sourceIndex),
      ...items[sourceParent].slice(sourceIndex + 1),
    ],
    [targetParent]: [
      ...items[targetParent].slice(0, targetIndex + modifier),
      sourceItem,
      ...items[targetParent].slice(targetIndex + modifier),
    ],
  };
}

export function move<
  T extends Items | Record<UniqueIdentifier, Items>,
  U extends Draggable,
  V extends Droppable,
  W extends DragDropManager<U, V>,
>(
  items: T,
  event: Parameters<
    DragDropEvents<U, V, W>['dragover'] | DragDropEvents<U, V, W>['dragend']
  >[0]
) {
  return mutate(items, event, arrayMove);
}

export function swap<
  T extends Items | Record<UniqueIdentifier, Items>,
  U extends Draggable,
  V extends Droppable,
  W extends DragDropManager<U, V>,
>(
  items: T,
  event: Parameters<
    DragDropEvents<U, V, W>['dragover'] | DragDropEvents<U, V, W>['dragend']
  >[0]
) {
  return mutate(items, event, arraySwap);
}
