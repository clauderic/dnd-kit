import {useContext, useEffect, useMemo, useRef} from 'react';
import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';
import {CSS, useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {SortingStrategy} from '../types';
import {arrayMove, isValidIndex} from '../utilities';
import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {AnimateLayoutChanges, SortableTransition} from './types';
import {useDerivedTransform} from './utilities';

export interface Arguments extends UseDraggableArguments {
  animateLayoutChanges?: AnimateLayoutChanges;
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

export function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled,
  id,
  strategy: localStrategy,
  transition = defaultTransition,
}: Arguments) {
  const {
    items,
    containerId,
    activeIndex,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy,
    wasSorting,
  } = useContext(Context);
  const {
    active,
    activeNodeRect,
    activatorEvent,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    transform,
  } = useDraggable({
    id,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes,
    },
    disabled,
  });
  const index = items.indexOf(id);
  const data = useMemo(() => ({containerId, index, items}), [
    containerId,
    index,
    items,
  ]);
  const {rect, node, setNodeRef: setDroppableNodeRef} = useDroppable({
    id,
    data,
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem =
    isSorting &&
    wasSorting.current &&
    !disableTransforms &&
    isValidIndex(activeIndex) &&
    isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement =
    shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy ?? globalStrategy;
  const finalTransform = displaceItem
    ? dragSourceDisplacement ??
      strategy({
        layoutRects: sortedRects,
        activeNodeRect,
        activeIndex,
        overIndex,
        index,
      })
    : null;
  const newIndex =
    isValidIndex(activeIndex) && isValidIndex(overIndex)
      ? arrayMove(items, activeIndex, overIndex).indexOf(id)
      : index;
  const prevNewIndex = useRef(newIndex);
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: prevNewIndex.current,
    transition,
    wasSorting: wasSorting.current,
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  useEffect(() => {
    if (isSorting) {
      prevNewIndex.current = newIndex;
    }
  }, [isSorting, newIndex]);

  return {
    active,
    attributes,
    activatorEvent,
    rect,
    index,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform ?? finalTransform,
    transition: getTransition(),
  };

  function getTransition() {
    if (derivedTransform) {
      // Temporarily disable transitions for a single frame to set up derived transforms
      return disabledTransition;
    }

    if (shouldDisplaceDragSource || !transition) {
      return null;
    }

    if (isSorting || shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty,
      });
    }

    return null;
  }
}
