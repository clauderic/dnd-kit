import type {Modifier} from '@dnd-kit/core';
import {restrictToBoundingRect} from './utilities';

export const restrictToFirstScrollableAncestor: Modifier = ({
  transform,
  activeNodeRect,
  scrollableAncestorRects,
}) => {
  const firstScrollableAncestorRect = scrollableAncestorRects[0];

  if (!activeNodeRect || !firstScrollableAncestorRect) {
    return transform;
  }

  return restrictToBoundingRect(
    transform,
    activeNodeRect,
    firstScrollableAncestorRect
  );
};
