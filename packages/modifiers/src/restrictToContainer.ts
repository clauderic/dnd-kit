import type {Modifier} from '@dnd-kit/core';
import {restrictToBoundingRect} from './utilities';

export const restrictToContainer: Modifier = ({
  transform,
  activeNodeRect,
  containerNodeRect,
}) => {
  if (!activeNodeRect || !containerNodeRect) {
    return transform;
  }

  return restrictToBoundingRect(transform, activeNodeRect, containerNodeRect);
};
