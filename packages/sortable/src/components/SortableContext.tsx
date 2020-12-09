import React, {useEffect, useMemo, useRef} from 'react';

import {
  useDndContext,
  PositionalClientRect,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {useUniqueId} from '@dnd-kit/utilities';

import {getSortedRects} from '../utilities';
import {SortingStrategy} from '../types';
import {clientRectSortingStrategy} from '../strategies';

interface Props {
  children: React.ReactNode;
  items: UniqueIdentifier[];
  strategy: SortingStrategy;
  id?: string;
}

const ID_PREFIX = 'Sortable';

interface ContextDescriptor {
  containerId: string;
  items: UniqueIdentifier[];
  overIndex: number;
  activeIndex: number;
  clientRects: PositionalClientRect[];
  disableInlineStyles: boolean;
  useClone: boolean;
  strategy: SortingStrategy;
}

export const Context = React.createContext<ContextDescriptor>({
  containerId: ID_PREFIX,
  items: [],
  overIndex: -1,
  activeIndex: -1,
  clientRects: [],
  disableInlineStyles: false,
  useClone: false,
  strategy: clientRectSortingStrategy,
});

export function SortableContext({
  children,
  id,
  items,
  strategy = clientRectSortingStrategy,
}: Props) {
  const {
    active,
    willRecomputeClientRects,
    clientRects,
    cloneNode,
    over,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useClone = cloneNode.clientRect !== null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const sortedClientRects = useMemo(() => getSortedRects(items, clientRects), [
    items,
    clientRects,
  ]);
  const disableInlineStyles =
    willRecomputeClientRects ||
    (overIndex !== -1 && activeIndex === -1) ||
    previousItemsRef.current !== items;

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  const contextValue = useMemo(
    (): ContextDescriptor => ({
      containerId,
      activeIndex,
      clientRects: sortedClientRects,
      disableInlineStyles,
      items,
      overIndex,
      useClone,
      strategy,
    }),
    [
      containerId,
      disableInlineStyles,
      items,
      activeIndex,
      overIndex,
      sortedClientRects,
      useClone,
      strategy,
    ]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
