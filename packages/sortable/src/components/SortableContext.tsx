import React, {useEffect, useMemo, useRef} from 'react';
import {
  useDndContext,
  ClientRect,
  UniqueIdentifier,
  Over,
} from '@schuchertmanagementberatung/dnd-kit-core';
import {
  useIsomorphicLayoutEffect,
  useUniqueId,
} from '@schuchertmanagementberatung/dnd-kit-utilities';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
  activeIndex?: number | null;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  activeIndex: number;
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
  activeIndex: activeIndexProp = null,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
    measuringScheduled,
  } = useDndContext();
  const sortableOverRef = useRef<Over | null>(null);
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = useMemo<UniqueIdentifier[]>(
    () =>
      userDefinedItems.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      ),
    [userDefinedItems]
  );
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const activeIndexUsed = activeIndexProp ?? activeIndex;
  const sortableOver = over?.data?.current?.sortable ? over : null;
  if (sortableOver) {
    sortableOverRef.current = sortableOver;
  }
  const overIndex = sortableOverRef.current
    ? items.indexOf(sortableOverRef.current.id)
    : -1;
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 && activeIndexUsed === -1) || itemsHaveChanged;
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
      activeIndex: activeIndexUsed,
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
      activeIndexUsed,
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
