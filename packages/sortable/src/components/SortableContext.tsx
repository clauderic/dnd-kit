import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, NewIndexGetter, SortingStrategy} from '../types';
import {normalizeDisabled} from '../utilities';
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
  useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => number;
  previousSortingStateRef: ReturnType<typeof usePreviousSortingStateRef>;
  useMyStrategyValue: (
    id: UniqueIdentifier,
    currentIndex: number,
    activeNodeRect: ClientRect | null
  ) => string | null;
}

export const Context = React.createContext<ContextDescriptor>({
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  useDragOverlay: false,
  disabled: {
    draggable: false,
    droppable: false,
  },
  useMyNewIndex: () => -1,
  previousSortingStateRef: {
    current: {activeId: null, containerId: '', items: []},
  },
  useMyStrategyValue: () => null,
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
    () => createSortingAPI(activeAndOverAPI, getNewIndex, strategy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    sortingAPI.init();
    return sortingAPI.clear;
  }, [sortingAPI]);

  sortingAPI.silentSetSortingInfo(droppableRects, items);
  const isDragging = active != null;
  const previousItemsRef = useRef(items);
  const itemsHaveChanged = sortingAPI.getItemsHaveChanged();
  const disableTransforms = !sortingAPI.getShouldDisplaceItems();
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

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
      useMyNewIndex: sortingAPI.useMyNewIndex,
      previousSortingStateRef,
      useMyStrategyValue: sortingAPI.useMyStrategyValue,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      items,
      useDragOverlay,
      sortingAPI,
      previousSortingStateRef,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
