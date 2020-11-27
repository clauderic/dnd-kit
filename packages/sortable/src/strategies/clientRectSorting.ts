import {arrayMove} from '../utilities';
import type {SortingStrategy} from '../types';

export const clientRectSortingStrategy: SortingStrategy = ({
  clientRects,
  activeIndex,
  overIndex,
  index,
}) => {
  const newClientRects = arrayMove(clientRects, overIndex, activeIndex);

  const oldRect = clientRects[index];
  const newRect = newClientRects[index];

  if (!newRect || !oldRect) {
    return;
  }

  return {
    x: newRect.offsetLeft - oldRect.offsetLeft,
    y: newRect.offsetTop - oldRect.offsetTop,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height,
  };
};
