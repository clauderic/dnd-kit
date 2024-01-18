import type {AnyData, Modifier} from '@dnd-kit/core';
import {restrictToBoundingRect} from './utilities';

export const restrictToParentElement: Modifier<AnyData, AnyData> = ({
  containerNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }

  return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
};
