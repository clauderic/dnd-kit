import type {SortingStrategy} from '../types';

export const swapClientRectStrategy: SortingStrategy = ({
  activeIndex,
  clientRects,
  index,
  overIndex,
}) => {
  let oldRect;
  let newRect;

  if (index === activeIndex) {
    oldRect = clientRects[index];
    newRect = clientRects[overIndex];
  }

  if (index === overIndex) {
    oldRect = clientRects[index];
    newRect = clientRects[activeIndex];
  }

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
