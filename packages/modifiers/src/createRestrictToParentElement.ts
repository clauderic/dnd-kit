import type {Modifier} from '@dnd-kit/core';
import {restrictToBoundingRect} from './utilities';

export function createRestrictToParentElement(gridSize?: number): Modifier {
  return ({containerNodeRect, draggingNodeRect, transform}) => {
    if (!draggingNodeRect || !containerNodeRect) {
      return transform;
    }

    return restrictToBoundingRect(
      transform,
      draggingNodeRect,
      containerNodeRect,
      gridSize
    );
  };
}
