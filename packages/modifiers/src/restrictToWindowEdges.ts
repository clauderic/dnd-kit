import type {AnyData, Modifier} from '@dnd-kit/core';

import {restrictToBoundingRect} from './utilities';

export const restrictToWindowEdges: Modifier<AnyData, AnyData> = ({
  transform,
  draggingNodeRect,
  windowRect,
}) => {
  if (!draggingNodeRect || !windowRect) {
    return transform;
  }

  return restrictToBoundingRect(transform, draggingNodeRect, windowRect);
};
