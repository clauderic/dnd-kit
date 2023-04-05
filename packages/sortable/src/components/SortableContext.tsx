import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, NewIndexGetter, SortingStrategy} from '../types';
import {normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import {createSortingAPI} from './sortingAPI';
import {useGlobalActiveRef} from './useGlobalActiveRef';
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
  items: UniqueIdentifier[];
  useDragOverlay: boolean;
  useMyNewIndex: (id: UniqueIdentifier, currentIndex: number) => number;
  globalActiveRef: ReturnType<typeof useGlobalActiveRef>;
  useMyStrategyValue: (
    id: UniqueIdentifier,
    currentIndex: number,
    activeNodeRect: ClientRect | null
  ) => string | null;
  useShouldUseDragTransform: (id: UniqueIdentifier) => boolean;
}

export const Context = React.createContext<ContextDescriptor>({
  containerId: ID_PREFIX,
  items: [],
  useDragOverlay: false,
  disabled: {
    draggable: false,
    droppable: false,
  },
  useMyNewIndex: () => -1,
  globalActiveRef: {
    current: {activeId: null, prevActiveId: null},
  },
  useMyStrategyValue: () => null,
  useShouldUseDragTransform: () => false,
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
  const disabled = normalizeDisabled(disabledProp);

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  const globalActiveRef = useGlobalActiveRef(active?.id || null);
  const contextValue = useMemo(
    (): ContextDescriptor => ({
      containerId,
      disabled,
      useShouldUseDragTransform: sortingAPI.useShouldUseDragTransform,
      items,
      useDragOverlay,
      useMyNewIndex: sortingAPI.useMyNewIndex,
      globalActiveRef,
      useMyStrategyValue: sortingAPI.useMyStrategyValue,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      containerId,
      disabled.draggable,
      disabled.droppable,
      // items,
      useDragOverlay,
      sortingAPI,
      globalActiveRef,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
