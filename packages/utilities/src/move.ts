import type {UniqueIdentifier, Draggable, Droppable} from '@dnd-kit/abstract';

/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
function arrayMove<T extends any[]>(array: T, from: number, to: number): T {
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
function arraySwap<T extends any[]>(array: T, from: number, to: number): T {
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
>(
  items: T,
  source: U,
  target: V,
  mutation: typeof arrayMove | typeof arraySwap
): T {
  if (source.id === target.id) {
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

  if (sourceParent == null || targetParent == null) {
    return items;
  }

  if (sourceParent === targetParent) {
    return {
      ...items,
      [sourceParent]: mutation(items[sourceParent], sourceIndex, targetIndex),
    };
  }

  const {dragOperation} = source.manager;
  const operationShape = dragOperation.shape;
  const targetShape = target.shape;
  const isBelowTarget =
    operationShape &&
    targetShape &&
    operationShape.center.y > targetShape.center.y;
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
>(items: T, source: U, target: V) {
  return mutate(items, source, target, arrayMove);
}

export function swap<
  T extends Items | Record<UniqueIdentifier, Items>,
  U extends Draggable,
  V extends Droppable,
>(items: T, source: U, target: V) {
  return mutate(items, source, target, arraySwap);
}
