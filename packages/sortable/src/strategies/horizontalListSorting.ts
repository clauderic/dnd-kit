import type {SortingStrategy} from '../types';

// TO-DO: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1,
};

export const horizontalListSortingStrategy: SortingStrategy = ({
  clientRects,
  activeIndex,
  overIndex,
  index,
}) => {
  const activeRect = clientRects[activeIndex];

  if (!activeRect) {
    return;
  }

  const itemGap = getItemGap(clientRects, index, activeIndex);

  if (index === activeIndex) {
    const newIndexRect = clientRects[overIndex];

    if (!newIndexRect) {
      return;
    }

    return {
      x:
        activeIndex < overIndex
          ? newIndexRect.right - activeRect.right
          : newIndexRect.left - activeRect.left,
      y: 0,
      ...defaultScale,
    };
  }

  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeRect.width - itemGap,
      y: 0,
      ...defaultScale,
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeRect.width + itemGap,
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
  clientRects: ClientRect[],
  index: number,
  activeIndex: number
) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];

  if (!previousRect && !nextRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect
      ? currentRect.left - previousRect.right
      : nextRect.left - currentRect.right;
  }

  return nextRect
    ? nextRect.left - currentRect.right
    : currentRect.left - previousRect.right;
}
