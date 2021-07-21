import {
  closestCorners,
  getViewRect,
  getScrollableAncestors,
  KeyboardCode,
  DroppableContainer,
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
  {context: {active, droppableContainers, translatedRect, scrollableAncestors}}
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !translatedRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const node = entry?.node.current;

      if (!node) {
        return;
      }

      const rect = getViewRect(node);
      const container: DroppableContainer = {
        ...entry,
        rect: {
          current: rect,
        },
      };

      switch (event.code) {
        case KeyboardCode.Down:
          if (translatedRect.top + translatedRect.height <= rect.top) {
            filteredContainers.push(container);
          }
          break;
        case KeyboardCode.Up:
          if (translatedRect.top >= rect.top + rect.height) {
            filteredContainers.push(container);
          }
          break;
        case KeyboardCode.Left:
          if (translatedRect.left >= rect.left + rect.width) {
            filteredContainers.push(container);
          }
          break;
        case KeyboardCode.Right:
          if (translatedRect.left + translatedRect.width <= rect.left) {
            filteredContainers.push(container);
          }
          break;
      }
    });

    const closestId = closestCorners({
      active,
      collisionRect: translatedRect,
      droppableContainers: filteredContainers,
    });

    if (closestId) {
      const newNode = droppableContainers.get(closestId)?.node.current;

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
