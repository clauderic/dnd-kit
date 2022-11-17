import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  activeIndex: number;
  placeholderIndex: number;
  containerId: string;
  disabled: Disabled;
  disableTransforms: boolean;
  items: UniqueIdentifier[];
  overIndex: number;
  useDragOverlay: boolean;
  sortedRects: ClientRect[];
  strategy: SortingStrategy;
}

export const Context = React.createContext<ContextDescriptor>({
  activeIndex: -1,
  placeholderIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false,
  },
});

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
  disabled: disabledProp = false,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
    measuringScheduled,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const currentPlaceholderId = over?.placeholderId.current;
  const overId = `${id}`.replace('sortable-', '');
  const isPlaceholderActive =
    over?.placeholderContainerId.current === id || over?.id === overId;
  const isSourceSortable =
    over?.placeholderContainerId.current ===
    active?.data.current?.sortable.containerId;
  const items = useMemo<UniqueIdentifier[]>(() => {
    const userDefinedIds = userDefinedItems.map((item) =>
    typeof item === 'object' && 'id' in item ? item.id : item
  );
    if (!isSourceSortable && isPlaceholderActive && currentPlaceholderId) {
      return [...userDefinedIds, currentPlaceholderId];
    }
    return userDefinedIds;
  }, [
    currentPlaceholderId,
    isPlaceholderActive,
    isSourceSortable,
    userDefinedItems,
  ]);

  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const placeholderIndex = currentPlaceholderId
    ? items.indexOf(currentPlaceholderId)
    : -1;
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 && activeIndex === -1 && placeholderIndex === -1) ||
    itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging && !measuringScheduled) {
      measureDroppableContainers(items);
    }
  }, [
    itemsHaveChanged,
    items,
    isDragging,
    measureDroppableContainers,
    measuringScheduled,
  ]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      activeIndex,
      placeholderIndex,
      containerId,
      disabled,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      strategy,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeIndex,
      placeholderIndex,
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      items,
      overIndex,
      droppableRects,
      useDragOverlay,
      strategy,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
