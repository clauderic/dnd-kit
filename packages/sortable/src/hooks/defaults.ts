import {CSS} from '@dnd-kit/utilities';
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableTransition,
} from './types';

export const defaultNewIndexGetter: NewIndexGetter = ({
  id,
  items,
  activeIndex,
  overIndex,
}) => {
  const index = items.indexOf(id);

  if (activeIndex > index && overIndex < index) {
    return index + 1;
  }
  if (activeIndex < index && overIndex > index) {
    return index - 1;
  }
  return index;
};

export const defaultAnimateLayoutChanges: AnimateLayoutChanges = ({
  containerId,
  isSorting,
  wasDragging,
  index,
  items,
  newIndex,
  previousItems,
  previousContainerId,
  transition,
}) => {
  if (!transition || !wasDragging) {
    return false;
  }

  if (previousItems !== items && index === newIndex) {
    return false;
  }

  if (isSorting) {
    return true;
  }

  return newIndex !== index && containerId === previousContainerId;
};

export const defaultTransition: SortableTransition = {
  duration: 200,
  easing: 'ease',
};

export const transitionProperty = 'transform';

export const disabledTransition = CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: 'linear',
});

export const defaultAttributes = {
  roleDescription: 'sortable',
};
