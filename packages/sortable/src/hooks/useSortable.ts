import {useContext, useEffect, useMemo, useRef} from 'react';
import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';
import {CSS, Transition, useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {SortingStrategy} from '../types';
import {arrayMove, isValidIndex} from '../utilities';
import {useDerivedTransform} from './utilities';

export interface Arguments extends UseDraggableArguments {
  strategy?: SortingStrategy;
  shouldPerformLayoutAnimation?: ShouldPerformLayoutAnimation;
  transition?: SortableTransition | null;
}

export type ShouldPerformLayoutAnimation = (args: {
  isSorting: boolean;
  id: Arguments['id'];
  index: number;
  newIndex: number;
  transition: Arguments['transition'];
}) => boolean;

export const defaultShouldPerformLayoutAnimation: ShouldPerformLayoutAnimation = ({
  isSorting,
  index,
  newIndex,
  transition,
}) => {
  if (!transition) {
    return false;
  }

  if (isSorting) {
    return true;
  }

  return newIndex !== index;
};

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

const defaultAttributes: Arguments['attributes'] = {
  roleDescription: 'sortable',
};

export function useSortable({
  disabled,
  id,
  attributes: userDefinedAttributes,
  strategy: localStrategy,
  shouldPerformLayoutAnimation = defaultShouldPerformLayoutAnimation,
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
  const performLayoutAnimation = shouldPerformLayoutAnimation({
    isSorting,
    id,
    index,
    newIndex: prevNewIndex.current,
    transition,
  });
  const finalTransition = performLayoutAnimation ? transition : null;

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
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform ?? finalTransform,
    transition: derivedTransform
      ? disabledTransition
      : finalTransition === null || shouldDisplaceDragSource
      ? undefined
      : CSS.Transition.toString({
          ...finalTransition,
          property,
        }),
  };
}
