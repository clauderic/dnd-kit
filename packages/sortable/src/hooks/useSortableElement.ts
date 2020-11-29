import {useContext, useMemo} from 'react';

import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';

import {SortableContext} from '../components';
import type {SortingStrategy} from '../types';

export interface Arguments extends UseDraggableArguments {
  strategy: SortingStrategy;
}

export function useSortableElement({disabled, id, strategy}: Arguments) {
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
    attributes,
    setNodeRef: setDraggableRef,
    listeners,
    isDragging,
    over,
    transform,
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
  const displaceItem =
    isSorting &&
    isValidIndex(activeIndex) &&
    isValidIndex(overIndex) &&
    !disableInlineStyles;
  const shouldDisplaceDragSource = !useClone && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource ? transform : null;
  const finalTransform = displaceItem
    ? dragSourceDisplacement ??
      strategy({clientRects, activeRect, activeIndex, overIndex, index})
    : null;

  return {
    attributes,
    clientRect,
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
