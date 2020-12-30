import type {Modifier} from '@dnd-kit/core';

import {restrictToBoundingRect} from './utilities';

export const restrictToWindowEdges: Modifier = ({
  transform,
  activeNodeRect,
  windowRect,
}) => {
  if (!activeNodeRect || !windowRect) {
    return transform;
  }

  return restrictToBoundingRect(transform, activeNodeRect, windowRect);
};
