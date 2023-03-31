import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, NewIndexGetter, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {createSortingAPI} from './sortingAPI';
import {usePreviousSortingStateRef} from './usePreviousSortingState';
import {defaultNewIndexGetter} from '../hooks/defaults';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
  getNewIndex?: NewIndexGetter;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  containerId: string;
  disabled: Disabled;
  disableTransforms: boolean;
  items: UniqueIdentifier[];
  useDragOverlay: boolean;
  strategy: SortingStrategy;
  useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => number;
  previousSortingStateRef: ReturnType<typeof usePreviousSortingStateRef>;
}

export const Context = React.createContext<ContextDescriptor>({
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  useDragOverlay: false,
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false,
  },
  useMyNewIndex: () => -1,
  previousSortingStateRef: {
    current: {activeId: null, containerId: '', items: []},
  },
});

export const ActiveContext = React.createContext({
  activeIndex: -1,
  overIndex: -1,
  sortedRects: [] as ClientRect[],
});

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
  disabled: disabledProp = false,
  getNewIndex = defaultNewIndexGetter,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    measureDroppableContainers,
    activeAndOverAPI,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = useMemo<UniqueIdentifier[]>(
    () =>
      userDefinedItems.map((item) =>
        typeof item === 'object' && 'id' in item ? item.id : item
      ),
    [userDefinedItems]
  );
  const sortingAPI = useMemo(
    () => createSortingAPI(items, activeAndOverAPI, getNewIndex),
    [activeAndOverAPI, items, getNewIndex]
  );
  useEffect(() => {
    return sortingAPI.clear;
  });
  const isDragging = active != null;
  const activeIndex = sortingAPI.getActiveIndex();
  const overIndex = sortingAPI.getOverIndex();
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 && activeIndex === -1) || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  const activeContextValue = useMemo(
    () => ({
      activeIndex,
      overIndex,
      sortedRects: getSortedRects(items, droppableRects),
    }),
    [activeIndex, droppableRects, items, overIndex]
  );
  const previousSortingStateRef = usePreviousSortingStateRef({
    activeId: active?.id || null,
    containerId,
    items,
  });
  const contextValue = useMemo(
    (): ContextDescriptor => ({
      containerId,
      disabled,
      disableTransforms,
      items,
      useDragOverlay,
      strategy,
      useMyNewIndex: sortingAPI.useMyNewIndex,
      previousSortingStateRef,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      items,
      useDragOverlay,
      strategy,
    ]
  );

  return (
    <Context.Provider value={contextValue}>
      <ActiveContext.Provider value={activeContextValue}>
        {children}
      </ActiveContext.Provider>
    </Context.Provider>
  );
}
