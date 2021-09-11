import type {LayoutRect} from '@dnd-kit/core';
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
  layoutRects,
  overIndex,
}) => {
  const activeNodeRect = layoutRects[activeIndex] ?? fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  if (index === activeIndex) {
    const overIndexRect = layoutRects[overIndex];

    if (!overIndexRect) {
      return null;
    }

    return {
      x: 0,
      y:
        activeIndex < overIndex
          ? overIndexRect.offsetTop +
            overIndexRect.height -
            (activeNodeRect.offsetTop + activeNodeRect.height)
          : overIndexRect.offsetTop - activeNodeRect.offsetTop,
      ...defaultScale,
    };
  }

  const itemGap = getItemGap(layoutRects, index, activeIndex);

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
  layoutRects: LayoutRect[],
  index: number,
  activeIndex: number
) {
  const currentRect: LayoutRect | undefined = layoutRects[index];
  const previousRect: LayoutRect | undefined = layoutRects[index - 1];
  const nextRect: LayoutRect | undefined = layoutRects[index + 1];

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
