import {CSS} from '@dnd-kit/utilities';

import type {AnimateLayoutChanges, SortableTransition} from './types';

export const defaultAnimateLayoutChanges: AnimateLayoutChanges = ({
  containerId,
  isSorting,
  index,
  items,
  newIndex,
  previousItems,
  previousContainerId,
  transition,
}) => {
  if (!transition) {
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
