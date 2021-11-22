import type {ClientRect} from '@dnd-kit/core';
import type {SortingStrategy} from '../types';

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const verticalListSortingStrategy: SortingStrategy = ({
  activeIndex,
  activeNodeRect: fallbackActiveRect,
  index,
  rects,
  overIndex,
}) => {
  const activeNodeRect = rects[activeIndex] ?? fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  if (index === activeIndex) {
    const overIndexRect = rects[overIndex];

    if (!overIndexRect) {
      return null;
    }

    return {
      x: 0,
      y:
        activeIndex < overIndex
          ? overIndexRect.top +
            overIndexRect.height -
            (activeNodeRect.top + activeNodeRect.height)
          : overIndexRect.top - activeNodeRect.top,
      ...defaultScale,
    };
  }

  const itemGap = getItemGap(rects, index, activeIndex);

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
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
  clientRects: ClientRect[],
  index: number,
  activeIndex: number
) {
  const currentRect: ClientRect | undefined = clientRects[index];
  const previousRect: ClientRect | undefined = clientRects[index - 1];
  const nextRect: ClientRect | undefined = clientRects[index + 1];

  if (!currentRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.top - (previousRect.top + previousRect.height)
      : nextRect
      ? nextRect.top - (currentRect.top + currentRect.height)
      : 0;
  }

  return nextRect
    ? nextRect.top - (currentRect.top + currentRect.height)
    : previousRect
    ? currentRect.top - (previousRect.top + previousRect.height)
    : 0;
}
