import type {LayoutRect} from '@dnd-kit/core';
import type {SortingStrategy} from '../types';

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const horizontalListSortingStrategy: SortingStrategy = ({
  layoutRects,
  activeNodeRect: fallbackActiveRect,
  activeIndex,
  overIndex,
  index,
}) => {
  const activeNodeRect = layoutRects[activeIndex] ?? fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  const itemGap = getItemGap(layoutRects, index, activeIndex);

  if (index === activeIndex) {
    const newIndexRect = layoutRects[overIndex];

    if (!newIndexRect) {
      return null;
    }

    return {
      x:
        activeIndex < overIndex
          ? newIndexRect.offsetLeft +
            newIndexRect.width -
            (activeNodeRect.offsetLeft + activeNodeRect.width)
          : newIndexRect.offsetLeft - activeNodeRect.offsetLeft,
      y: 0,
      ...defaultScale,
    };
  }

  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeNodeRect.width - itemGap,
      y: 0,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeNodeRect.width + itemGap,
      y: 0,
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

  if (!currentRect || (!previousRect && !nextRect)) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.offsetLeft - (previousRect.offsetLeft + previousRect.width)
      : nextRect.offsetLeft - (currentRect.offsetLeft + currentRect.width);
  }

  return nextRect
    ? nextRect.offsetLeft - (currentRect.offsetLeft + currentRect.width)
    : currentRect.offsetLeft - (previousRect.offsetLeft + previousRect.width);
}
