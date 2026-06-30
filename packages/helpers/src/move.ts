import type {
  UniqueIdentifier,
  Draggable,
  Droppable,
  DragDropManager,
  DragDropEventMap,
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
 * Swap two array items with each other. Returns a new array with the two items at `from` and `to` exchanged in place.
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

/**
 * Resolve a grouped record key from a UniqueIdentifier.
 * Object keys are strings at runtime, even when sortable groups use numeric IDs.
 */
function getRecordKey(
  items: Record<UniqueIdentifier, Items>,
  id: UniqueIdentifier
) {
  const key = String(id);

  return Object.prototype.hasOwnProperty.call(items, key) ? key : undefined;
}

/**
 * Resolve an item ID from either a primitive item or an object with an `id` field.
 */
function getItemId(item: Items[number]): UniqueIdentifier | undefined {
  if (item === null) {
    return undefined;
  }

  return typeof item === 'object' && 'id' in item ? item.id : item;
}

/**
 * Resolve the insertion index for a container target.
 * Uses measured child centers when available, excluding the source item for same-container moves.
 * Falls back to the container center when child measurements are unavailable.
 */
function getContainerInsertionIndex(
  children: Items,
  source: Draggable,
  target: Droppable,
  position: {y: number},
  excludedItemId?: UniqueIdentifier
) {
  const {registry} = source.manager!;
  let hasMeasuredChildren = false;
  let insertionIndex = 0;

  for (const item of children) {
    const id = getItemId(item);

    if (id === excludedItemId) {
      continue;
    }

    const droppable = id == null ? undefined : registry?.droppables.get(id);

    if (droppable?.shape) {
      hasMeasuredChildren = true;

      if (Math.round(position.y) < Math.round(droppable.shape.center.y)) {
        return insertionIndex;
      }
    }

    insertionIndex++;
  }

  if (hasMeasuredChildren) {
    return insertionIndex;
  }

  return target.shape && position.y > target.shape.center.y
    ? insertionIndex
    : 0;
}

/**
 * Check if the source has sortable index properties via duck typing.
 * The `move` helper lives in `@dnd-kit/helpers` which has no dependency on `@dnd-kit/dom`,
 * so we discover sortable properties at runtime.
 */
function hasSortableIndices(source: Draggable): source is Draggable & {
  initialIndex: number;
  index: number;
  initialGroup: UniqueIdentifier | undefined;
  group: UniqueIdentifier | undefined;
} {
  return (
    'initialIndex' in source &&
    typeof source.initialIndex === 'number' &&
    'index' in source &&
    typeof source.index === 'number'
  );
}

function mutate<
  T extends Items | Record<UniqueIdentifier, Items>,
  U extends Draggable,
  V extends Droppable,
  W extends DragDropManager<U, V>,
>(
  items: T,
  event: DragDropEventMap<U, V, W>['dragover'] | DragDropEventMap<U, V, W>['dragend'],
  mutation: typeof arrayMove | typeof arraySwap
): T {
  const {source, target, canceled} = event.operation;

  if (!source || !target || canceled) {
    if ('preventDefault' in event) event.preventDefault();
    return items;
  }

  const findIndex = (item: Items[0], id: UniqueIdentifier) =>
    getItemId(item) === id;

  if (Array.isArray(items)) {
    const sourceIndex = items.findIndex((item) => findIndex(item, source.id));
    const targetIndex = items.findIndex((item) => findIndex(item, target.id));

    if (sourceIndex === -1 || targetIndex === -1) {
      // Fallback: when the ID-based lookup fails (e.g. computed IDs that don't
      // match data items), use the sortable index properties directly.
      if (hasSortableIndices(source)) {
        const from = source.initialIndex;
        const to = source.index;

        if (from === to || from < 0 || from >= items.length) {
          if ('preventDefault' in event) event.preventDefault();
          return items;
        }

        return mutation(items, from, to);
      }

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

  // Grouped/record case

  const entries = Object.entries(items);

  let sourceIndex = -1;
  let sourceParent: UniqueIdentifier | undefined;
  let targetIndex = -1;
  let targetParent: UniqueIdentifier | undefined;
  let targetIsContainer = false;

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

  // Fallback: when the ID-based lookup fails for the source (e.g. computed IDs),
  // use the sortable index properties directly.
  if (sourceIndex === -1 && hasSortableIndices(source)) {
    const srcParent =
      source.initialGroup == null
        ? undefined
        : getRecordKey(items, source.initialGroup);
    const srcIndex = source.initialIndex;
    const tgtParent =
      source.group == null ? undefined : getRecordKey(items, source.group);
    const tgtIndex = source.index;

    if (srcParent == null || tgtParent == null) {
      if ('preventDefault' in event) event.preventDefault();
      return items;
    }

    if (srcParent === tgtParent && srcIndex === tgtIndex) {
      if ('preventDefault' in event) event.preventDefault();
      return items;
    }

    if (srcParent === tgtParent) {
      return {
        ...items,
        [srcParent]: mutation(items[srcParent], srcIndex, tgtIndex),
      };
    }

    // Cross-group transfer
    const sourceItem = items[srcParent][srcIndex];

    return {
      ...items,
      [srcParent]: [
        ...items[srcParent].slice(0, srcIndex),
        ...items[srcParent].slice(srcIndex + 1),
      ],
      [tgtParent]: [
        ...items[tgtParent].slice(0, tgtIndex),
        sourceItem,
        ...items[tgtParent].slice(tgtIndex),
      ],
    };
  }

  if (!source.manager) return items;

  const {dragOperation} = source.manager;
  const position =
    dragOperation.shape?.current.center ?? dragOperation.position.current;

  if (targetParent == null) {
    const targetKey = getRecordKey(items, target.id);

    if (targetKey != null) {
      const insertionIndex = getContainerInsertionIndex(
        items[targetKey],
        source,
        target,
        position,
        sourceParent === targetKey ? source.id : undefined
      );

      // The target does not have any matching children, but appears to be a valid target
      targetParent = targetKey;
      targetIndex = insertionIndex;
      targetIsContainer = true;
    }
  }

  if (
    sourceParent == null ||
    targetParent == null ||
    (sourceParent === targetParent && sourceIndex === targetIndex)
  ) {
    // Reconcile optimistic sorting for grouped records.
    // When the ID-based lookup finds source and target at the same position
    // (e.g. source.id === target.id after optimistic sorting), check if the
    // sortable indices indicate a different position.
    if (
      sourceParent != null &&
      sourceParent === targetParent &&
      sourceIndex === targetIndex &&
      hasSortableIndices(source)
    ) {
      const sourceGroupParent =
        source.group == null ? undefined : getRecordKey(items, source.group);
      const hasGroupChanged =
        source.group != null && sourceGroupParent !== sourceParent;
      const hasIndexChanged = source.index !== sourceIndex;

      if (hasGroupChanged || hasIndexChanged) {
        const reconciledTargetParent =
          source.group == null ? sourceParent : sourceGroupParent;

        if (reconciledTargetParent != null) {
          if (sourceParent === reconciledTargetParent) {
            return {
              ...items,
              [sourceParent]: mutation(
                items[sourceParent],
                sourceIndex,
                source.index
              ),
            };
          }

          // Cross-group transfer
          const sourceItem = items[sourceParent][sourceIndex];
          return {
            ...items,
            [sourceParent]: [
              ...items[sourceParent].slice(0, sourceIndex),
              ...items[sourceParent].slice(sourceIndex + 1),
            ],
            [reconciledTargetParent]: [
              ...items[reconciledTargetParent].slice(0, source.index),
              sourceItem,
              ...items[reconciledTargetParent].slice(source.index),
            ],
          };
        }
      }
    }

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
  const modifier = targetIsContainer ? 0 : isBelowTarget ? 1 : 0;
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
  event: DragDropEventMap<U, V, W>['dragover'] | DragDropEventMap<U, V, W>['dragend']
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
  event: DragDropEventMap<U, V, W>['dragover'] | DragDropEventMap<U, V, W>['dragend']
) {
  return mutate(items, event, arraySwap);
}
