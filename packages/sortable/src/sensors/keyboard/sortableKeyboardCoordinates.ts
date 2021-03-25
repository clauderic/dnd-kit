import {
  closestCorners,
  getViewRect,
  getScrollableAncestors,
  KeyboardCode,
  RectEntry,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

export const sortableKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  {context: {droppableContainers, translatedRect, scrollableAncestors}}
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!translatedRect) {
      return;
    }

    const layoutRects: RectEntry[] = [];

    Object.entries(droppableContainers).forEach(([id, container]) => {
      if (container?.disabled) {
        return;
      }

      const node = container?.node.current;

      if (!node) {
        return;
      }

      const rect = getViewRect(node);

      switch (event.code) {
        case KeyboardCode.Down:
          if (translatedRect.top + translatedRect.height <= rect.top) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Up:
          if (translatedRect.top >= rect.top + rect.height) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Left:
          if (translatedRect.left >= rect.left + rect.width) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Right:
          if (translatedRect.left + translatedRect.width <= rect.left) {
            layoutRects.push([id, rect]);
          }
          break;
      }
    });

    const closestId = closestCorners(layoutRects, translatedRect);

    if (closestId) {
      const newNode = droppableContainers[closestId]?.node.current;

      if (newNode) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some(
          (element, index) => scrollableAncestors[index] !== element
        );
        const newRect = getViewRect(newNode);
        const offset = hasDifferentScrollAncestors
          ? {
              x: 0,
              y: 0,
            }
          : {
              x: translatedRect.width - newRect.width,
              y: translatedRect.height - newRect.height,
            };
        const newCoordinates = {
          x: newRect.left - offset.x,
          y: newRect.top - offset.y,
        };

        return newCoordinates;
      }
    }
  }

  return undefined;
};
