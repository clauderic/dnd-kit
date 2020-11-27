import React, {createContext, useContext, useMemo} from 'react';

import {
  __internal__ActiveDraggableContext as ActiveDraggableContext,
  useDraggable,
  useDroppable,
  UseDraggableArguments,
} from '@dropshift/core';
import {CSS} from '@dropshift/utilities';

import {SortableContext} from '../components';
import type {SortingStrategy} from '../types';

export interface Arguments extends UseDraggableArguments {
  transition?: React.CSSProperties['transition'];
  strategy: SortingStrategy;
}

const defaultArguments: Partial<Arguments> = {
  transition: 'transform 250ms ease',
};

const NullContext = createContext<any>(null);

export function useSortableElement(args: Arguments) {
  const {disabled, id, strategy, transition} = {
    ...defaultArguments,
    ...args,
  };
  const {
    items,
    containerId,
    activeIndex,
    clientRects,
    overIndex,
    disableInlineStyles,
    useClone,
  } = useContext(SortableContext);
  const {
    active,
    activeRect,
    setNodeRef: setDraggableRef,
    listeners,
    isDragging,
    over,
  } = useDraggable({
    id,
    disabled,
  });

  const index = items.indexOf(id);
  const data = useMemo(() => ({containerId, index, items}), [
    containerId,
    index,
    items,
  ]);
  const {clientRect, node, setNodeRef: setDroppableRef} = useDroppable({
    id,
    data,
  });
  const isSorting = Boolean(active);

  const shouldTransformDragSource = !useClone && isDragging;
  const transform = useContext(
    shouldTransformDragSource ? ActiveDraggableContext : NullContext
  );

  const finalTransform =
    isValidIndex(activeIndex) && isValidIndex(overIndex) && !disableInlineStyles
      ? transform ??
        strategy({clientRects, activeRect, activeIndex, overIndex, index})
      : null;

  // Transitions and transforms can interfere with ClientRect measurements
  // We momentarily disable inline styles while ClientRects are being recomputed
  const inlineStyles = disableInlineStyles
    ? undefined
    : {
        transform:
          isSorting && finalTransform
            ? CSS.Transform.toString(finalTransform)
            : undefined,
        transition: isSorting ? transition : undefined,
      };

  return {
    clientRect,
    inlineStyles,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef: (node: HTMLElement | null) => {
      setDraggableRef(node);
      setDroppableRef(node);
    },
    transform: finalTransform,
  };
}

function isValidIndex(index: number | null): index is number {
  return index !== null && index >= 0;
}
