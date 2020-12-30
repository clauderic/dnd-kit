import type {SortingStrategy} from '../types';

export const rectSwappingStrategy: SortingStrategy = ({
  activeIndex,
  index,
  layoutRects,
  overIndex,
}) => {
  let oldRect;
  let newRect;

  if (index === activeIndex) {
    oldRect = layoutRects[index];
    newRect = layoutRects[overIndex];
  }

  if (index === overIndex) {
    oldRect = layoutRects[index];
    newRect = layoutRects[activeIndex];
  }

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
