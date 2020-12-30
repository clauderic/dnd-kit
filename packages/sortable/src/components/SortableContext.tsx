import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, LayoutRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import {getSortedLayoutRects} from '../utilities';
import {SortingStrategy} from '../types';
import {rectSortingStrategy} from '../strategies';

export interface Props {
  children: React.ReactNode;
  items: UniqueIdentifier[];
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
  sortedLayoutRects: LayoutRect[];
  strategy: SortingStrategy;
}

export const Context = React.createContext<ContextDescriptor>({
  activeIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedLayoutRects: [],
  strategy: rectSortingStrategy,
});

export function SortableContext({
  children,
  id,
  items,
  strategy = rectSortingStrategy,
}: Props) {
  const {
    active,
    overlayNode,
    droppableLayoutRectsMap,
    over,
    recomputeLayouts,
    willRecomputeLayouts,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useDragOverlay = overlayNode.rect !== null;
  const activeIndex = active ? items.indexOf(active) : -1;
  const isSorting = activeIndex !== -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const sortedLayoutRects = getSortedLayoutRects(
    items,
    droppableLayoutRectsMap
  );
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

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      activeIndex,
      containerId,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedLayoutRects,
      strategy,
    }),
    [
      activeIndex,
      containerId,
      disableTransforms,
      items,
      overIndex,
      sortedLayoutRects,
      useDragOverlay,
      strategy,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function isEqual(arr1: string[], arr2: string[]) {
  return arr1.join() === arr2.join();
}
