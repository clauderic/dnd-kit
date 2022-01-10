import {useContext, useEffect, useMemo, useRef} from 'react';
import {
  useDraggable,
  useDroppable,
  UseDraggableArguments,
  UseDroppableArguments,
} from '@dnd-kit/core';
import {CSS, isKeyboardEvent, useCombinedRefs} from '@dnd-kit/utilities';

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

export interface Arguments
  extends UseDraggableArguments,
    Pick<UseDroppableArguments, 'resizeObserverConfig'> {
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
  resizeObserverConfig,
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
  } = useContext(Context);
  const index = items.indexOf(id);
  const data = useMemo(
    () => ({sortable: {containerId, index, items}, ...customData}),
    [containerId, customData, index, items]
  );
  const itemsAfterCurrentSortable = useMemo(
    () => items.slice(items.indexOf(id)),
    [items, id]
  );
  const {rect, node, isOver, setNodeRef: setDroppableNodeRef} = useDroppable({
    id,
    data,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig,
    },
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
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
  const activeId = active?.id;
  const previous = useRef({
    activeId,
    items,
    newIndex,
    containerId,
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null,
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  useEffect(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }

    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }

    if (items !== previous.current.items) {
      previous.current.items = items;
    }

    if (activeId !== previous.current.activeId) {
      previous.current.activeId = activeId;
    }
  }, [activeId, isSorting, newIndex, containerId, items]);

  return {
    active,
    activeIndex,
    attributes,
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
      (itemsHaveChanged && previous.current.newIndex === index)
    ) {
      return disabledTransition;
    }

    if (
      (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent)) ||
      !transition
    ) {
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
