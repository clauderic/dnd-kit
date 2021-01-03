import {
  closestCorners,
  getViewRect,
  KeyboardCode,
  RectEntry,
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
  {context: {translatedRect, droppableContainers}}
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
        const newRect = getViewRect(newNode);
        const newCoordinates = getCoordinatesDelta({
          x: newRect.left - (translatedRect.width - newRect.width),
          y: newRect.top - (translatedRect.height - newRect.height),
        });

        return newCoordinates;
      }
    }
  }

  return undefined;
};
