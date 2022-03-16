import {
  closestCorners,
  getScrollableAncestors,
  getFirstCollision,
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
  {
    context: {
      active,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors,
    },
  }
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !collisionRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = entry?.rect.current;

      if (!rect) {
        return;
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left > rect.left) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left < rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });

    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });
    let closestId = getFirstCollision(collisions, 'id');

    if (closestId === over?.id && collisions.length > 1) {
      closestId = collisions[1].id;
    }

    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;

      if (newNode && newRect) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some(
          (element, index) => scrollableAncestors[index] !== element
        );
        const offset = hasDifferentScrollAncestors
          ? {
              x: 0,
              y: 0,
            }
          : {
              x: collisionRect.width - newRect.width,
              y: collisionRect.height - newRect.height,
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
