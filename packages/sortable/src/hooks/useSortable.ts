import {useContext, useEffect, useMemo, useRef} from 'react';
import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';
import {CSS, useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {SortingStrategy} from '../types';
import {isValidIndex} from '../utilities';
import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultNewIndexGetter,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableTransition,
} from './types';
import {useDerivedTransform} from './utilities';

export interface Arguments extends UseDraggableArguments {
  animateLayoutChanges?: AnimateLayoutChanges;
  getNewIndex?: NewIndexGetter;
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

export function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled,
  data: customData,
  getNewIndex = defaultNewIndexGetter,
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
    wasDragging,
  } = useContext(Context);
  const index = items.indexOf(id);
  const data = useMemo(
    () => ({sortable: {containerId, index, items}, ...customData}),
    [containerId, customData, index, items]
  );
  const {
    collisions,
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef,
  } = useDroppable({
    id,
    data,
  });
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
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes,
    },
    disabled,
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem =
    isSorting &&
    wasDragging.current &&
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
        rects: sortedRects,
        activeNodeRect,
        activeIndex,
        overIndex,
        index,
      })
    : null;
  const newIndex =
    isValidIndex(activeIndex) && isValidIndex(overIndex)
      ? getNewIndex({id, items, activeIndex, overIndex})
      : index;
  const prevItems = useRef(items);
  const itemsHaveChanged = items !== prevItems.current;
  const prevNewIndex = useRef(newIndex);
  const previousContainerId = useRef(containerId);
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: prevNewIndex.current,
    previousItems: prevItems.current,
    previousContainerId: previousContainerId.current,
    transition,
    wasDragging: wasDragging.current,
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  useEffect(() => {
    if (isSorting && prevNewIndex.current !== newIndex) {
      prevNewIndex.current = newIndex;
    }

    if (containerId !== previousContainerId.current) {
      previousContainerId.current = containerId;
    }

    if (items !== prevItems.current) {
      prevItems.current = items;
    }
  }, [isSorting, newIndex, containerId, items]);

  return {
    active,
    activeIndex,
    attributes,
    activatorEvent,
    collisions,
    rect,
    index,
    newIndex,
    items,
    isOver,
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
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform ||
      // Or to prevent items jumping to back to their "new" position when items change
      (itemsHaveChanged && prevNewIndex.current === index)
    ) {
      return disabledTransition;
    }

    if (shouldDisplaceDragSource || !transition) {
      return undefined;
    }

    if (isSorting || shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty,
      });
    }

    return undefined;
  }
}
