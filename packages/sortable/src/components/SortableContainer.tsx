import React, {useEffect, useMemo, useRef} from 'react';

import {
  useDraggableContext,
  PositionalClientRect,
  UniqueIdentifier,
} from '@dropshift/core';

import {useUniqueId} from '../hooks/utilities';

type PositionalClientRectMap = ReturnType<
  typeof useDraggableContext
>['clientRects'];

interface Props {
  children: React.ReactNode;
  items: UniqueIdentifier[];
  id?: string;
}

const ID_PREFIX = 'SortableContainer';

export const Context = React.createContext<{
  containerId: string;
  items: UniqueIdentifier[];
  overIndex: number;
  activeIndex: number;
  clientRects: PositionalClientRect[];
  disableInlineStyles: boolean;
  useClone: boolean;
}>({
  containerId: ID_PREFIX,
  items: [],
  overIndex: -1,
  activeIndex: -1,
  clientRects: [],
  disableInlineStyles: false,
  useClone: false,
});

export function SortableContainer({children, id, items}: Props) {
  const {
    active,
    willRecomputeClientRects,
    clientRects,
    cloneNode,
    over,
  } = useDraggableContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useClone = cloneNode.clientRect !== null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const sortedClientRects = useMemo(() => getItemRects(items, clientRects), [
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

  const contextValue = useMemo(() => {
    return {
      containerId,
      activeIndex,
      clientRects: sortedClientRects,
      disableInlineStyles,
      items,
      overIndex,
      useClone,
    };
  }, [
    containerId,
    disableInlineStyles,
    items,
    activeIndex,
    overIndex,
    sortedClientRects,
    useClone,
  ]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function getItemRects(
  items: Props['items'],
  clientRects: PositionalClientRectMap
) {
  return items.reduce<PositionalClientRect[]>((accumulator, id) => {
    const clientRect = clientRects.get(id);

    if (clientRect) {
      accumulator.push(clientRect);
    }

    return accumulator;
  }, []);
}
