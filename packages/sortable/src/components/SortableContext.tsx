import React, {MutableRefObject, useEffect, useMemo, useRef} from 'react';
import {useDndContext, LayoutRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {SortingStrategy} from '../types';
import {getSortedRects} from '../utilities';
import {rectSortingStrategy} from '../strategies';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  activeIndex: number;
  containerId: string;
  disableTransforms: boolean;
  items: UniqueIdentifier[];
  overIndex: number;
  useDragOverlay: boolean;
  sortedRects: LayoutRect[];
  strategy: SortingStrategy;
  wasDragging: MutableRefObject<boolean>;
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
  wasDragging: {current: false},
});

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    recomputeLayouts,
    willRecomputeLayouts,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = useMemo(
    () =>
      userDefinedItems.map((item) =>
        typeof item === 'string' ? item : item.id
      ),
    [userDefinedItems]
  );
  const isDragging = active != null;
  const wasDragging = useRef(false);
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const isSorting = activeIndex !== -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const sortedRects = getSortedRects(items, droppableRects);
  const itemsHaveChanged = !isEqual(items, previousItemsRef.current);
  const disableTransforms =
    (overIndex !== -1 && activeIndex === -1) || itemsHaveChanged;

  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isSorting && !willRecomputeLayouts) {
      // To-do: Add partial recompution of only subset of rects
      recomputeLayouts();
    }
  }, [itemsHaveChanged, isSorting, recomputeLayouts, willRecomputeLayouts]);

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      wasDragging.current = isDragging;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isDragging]);

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      activeIndex,
      containerId,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects,
      strategy,
      wasDragging,
    }),
    [
      activeIndex,
      containerId,
      disableTransforms,
      items,
      overIndex,
      sortedRects,
      useDragOverlay,
      strategy,
      wasDragging,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function isEqual(arr1: string[], arr2: string[]) {
  return arr1.join() === arr2.join();
}
