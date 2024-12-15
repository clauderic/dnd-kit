import React, {useEffect, useMemo, useRef} from 'react';
import {useDndContext, ClientRect, UniqueIdentifier} from '@dnd-kit/core';
import {useIsomorphicLayoutEffect, useUniqueId} from '@dnd-kit/utilities';

import type {Disabled, SortingStrategy} from '../types';
import {getSortedRects, itemsEqual, normalizeDisabled} from '../utilities';
import {rectSortingStrategy} from '../strategies';
import type {IndexGetter} from 'packages/sortable/src/hooks/types';
import {defaultIndexGetter} from 'packages/sortable/src/hooks/defaults';

export interface Props {
  children: React.ReactNode;
  items: (UniqueIdentifier | {id: UniqueIdentifier})[];
  strategy?: SortingStrategy;
  id?: string;
  disabled?: boolean | Disabled;
  getItemIndex?: IndexGetter;
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
  getItemIndex: IndexGetter;
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
  getItemIndex: defaultIndexGetter,
});

export function SortableContext({
  children,
  id,
  items: userDefinedItems,
  strategy = rectSortingStrategy,
  disabled: disabledProp = false,
  getItemIndex = defaultIndexGetter,
}: Props) {
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers,
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
  const isDragging = active != null;
  const activeIndex = active ? getItemIndex({id: active.id, items}) : -1;
  const overIndex = over ? getItemIndex({id: over.id, items}) : -1;
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

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      activeIndex,
      containerId,
      disabled,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      strategy,
      getItemIndex,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeIndex,
      containerId,
      disabled.draggable,
      disabled.droppable,
      disableTransforms,
      items,
      overIndex,
      droppableRects,
      useDragOverlay,
      strategy,
      getItemIndex,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
