import {CSS} from '@dnd-kit/utilities';

import type {AnimateLayoutChanges, SortableTransition} from './types';

export const defaultAnimateLayoutChanges: AnimateLayoutChanges = ({
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
