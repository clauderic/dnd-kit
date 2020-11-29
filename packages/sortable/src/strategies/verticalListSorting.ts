import type {PositionalClientRect} from '@dnd-kit/core';
import type {SortingStrategy} from '../types';

// TO-DO: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const verticalListSortingStrategy: SortingStrategy = ({
  clientRects,
  activeIndex,
  activeRect: fallbackActiveRect,
  overIndex,
  index,
}) => {
  // We always want to try to get the latest rect for the active index
  // but for virtualized lists, we may need to fall back to the old cached
  // activeRect since the item may have unmounted out of the viewport
  const activeRect = clientRects[activeIndex] ?? fallbackActiveRect;

  if (!activeRect) {
    return;
  }

  if (index === activeIndex) {
    const overIndexRect = clientRects[overIndex];

    if (!overIndexRect) {
      return;
    }

    return {
      x: 0,
      y:
        activeIndex < overIndex
          ? overIndexRect.offsetTop +
            overIndexRect.height -
            (activeRect.offsetTop + activeRect.height)
          : overIndexRect.offsetTop - activeRect.offsetTop,
      ...defaultScale,
    };
  }

  const itemGap = getItemGap(clientRects, index, activeIndex);

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeRect.height - itemGap,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeRect.height + itemGap,
      ...defaultScale,
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale,
  };
};

function getItemGap(
  clientRects: PositionalClientRect[],
  index: number,
  activeIndex: number
) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];

  if (!currentRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height)
      : nextRect
      ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height)
      : 0;
  }

  return nextRect
    ? nextRect.offsetTop - (currentRect.offsetTop + currentRect.height)
    : previousRect
    ? currentRect.offsetTop - (previousRect.offsetTop + previousRect.height)
    : 0;
}
