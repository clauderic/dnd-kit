import {CSS} from '@dnd-kit/utilities';

import {arrayMove} from '../utilities';

import type {
  AnimateLayoutChanges,
  IndexGetter,
  NewIndexGetter,
  SortableTransition,
} from './types';

export const defaultNewIndexGetter: NewIndexGetter = ({
  id,
  items,
  activeIndex,
  overIndex,
}) => arrayMove(items, activeIndex, overIndex).indexOf(id);

export const defaultIndexGetter: IndexGetter = ({id, items}) =>
  items.indexOf(id);

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
