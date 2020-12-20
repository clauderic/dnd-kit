import {
  closestCorners,
  getScrollOffsets,
  KeyboardCode,
  LayoutRectEntry,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {subtract as getCoordinatesDelta} from '@dnd-kit/utilities';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

export const sortableKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  {context: {activeNodeRect, droppableLayoutRectsMap, scrollableAncestors}}
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!activeNodeRect) {
      throw new Error('Active element does not have an associated rect');
    }

    const layoutRects: LayoutRectEntry[] = [];

    droppableLayoutRectsMap.forEach((rect, id) => {
      switch (event.code) {
        case KeyboardCode.Down:
          if (activeNodeRect.top + activeNodeRect.height <= rect.offsetTop) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Up:
          if (activeNodeRect.top >= rect.offsetTop + rect.height) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Left:
          if (activeNodeRect.left >= rect.offsetLeft + rect.width) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Right:
          if (activeNodeRect.left + activeNodeRect.width <= rect.offsetLeft) {
            layoutRects.push([id, rect]);
          }
          break;
      }
    });

    const closestId = closestCorners(layoutRects, activeNodeRect);

    if (closestId) {
      const newRect = droppableLayoutRectsMap.get(closestId);

      if (newRect) {
        const newCoordinates = getCoordinatesDelta(
          {
            x: newRect.offsetLeft - (activeNodeRect.width - newRect.width),
            y: newRect.offsetTop - (activeNodeRect.height - newRect.height),
          },
          getScrollOffsets(scrollableAncestors)
        );

        return newCoordinates;
      }
    }
  }

  return undefined;
};
