import {useContext, useEffect, useMemo, useRef} from 'react';
import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';
import {CSS, Transition, useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {SortingStrategy} from '../types';
import {arrayMove, isValidIndex} from '../utilities';
import {useDerivedTransform} from './utilities';

export interface Arguments extends UseDraggableArguments {
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

type SortableTransition = Pick<Transition, 'easing' | 'duration'>;

export const defaultTransition: SortableTransition = {
  duration: 200,
  easing: 'ease',
};
const property = 'transform';
const disabledTransition = CSS.Transition.toString({
  property,
  duration: 0,
  easing: 'linear',
});

export function useSortable({
  disabled,
  id,
  strategy: localStrategy,
  transition: sortingTransition = defaultTransition,
}: Arguments) {
  const {
    items,
    containerId,
    activeIndex,
    disableTransforms,
    sortedLayoutRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy,
  } = useContext(Context);
  const {
    active,
    activeNodeRect,
    activatorEvent,
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
  const {rect, node, setNodeRef: setDroppableRef} = useDroppable({
    id,
    data,
  });
  const setNodeRef = useCombinedRefs(setDroppableRef, setDraggableRef);
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
        layoutRects: sortedLayoutRects,
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
  const transition =
    !sortingTransition || (!isSorting && index === prevNewIndex.current)
      ? null
      : sortingTransition;

  const derivedTransform = useDerivedTransform({
    disabled: transition === null,
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
    setDroppableRef,
    setDraggableRef,
    transform: derivedTransform ?? finalTransform,
    transition: derivedTransform
      ? disabledTransition
      : transition === null || shouldDisplaceDragSource
      ? undefined
      : CSS.Transition.toString({
          ...transition,
          property,
        }),
  };
}
