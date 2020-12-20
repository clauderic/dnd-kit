import {arrayMove} from '../utilities';
import type {SortingStrategy} from '../types';

export const rectSortingStrategy: SortingStrategy = ({
  layoutRects,
  activeIndex,
  overIndex,
  index,
}) => {
  const newRects = arrayMove(layoutRects, overIndex, activeIndex);

  const oldRect = layoutRects[index];
  const newRect = newRects[index];

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.offsetLeft - oldRect.offsetLeft,
    y: newRect.offsetTop - oldRect.offsetTop,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height,
  };
};
