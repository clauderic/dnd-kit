import {
  closestCorners,
  getScrollableAncestors,
  getFirstCollision,
  KeyboardCode,
  DroppableContainer,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {subtract} from '@dnd-kit/utilities';

import {hasSortableData} from '../../types';

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

      const rect = droppableRects.get(entry.id);

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
      const activeDroppable = droppableContainers.get(active.id);
      const newDroppable = droppableContainers.get(closestId);
      const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
      const newNode = newDroppable?.node.current;

      if (newNode && newRect && activeDroppable && newDroppable) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some(
          (element, index) => scrollableAncestors[index] !== element
        );
        const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
        const isAfterActive = isAfter(activeDroppable, newDroppable);
        const offset =
          hasDifferentScrollAncestors || !hasSameContainer
            ? {
                x: 0,
                y: 0,
              }
            : {
                x: isAfterActive ? collisionRect.width - newRect.width : 0,
                y: isAfterActive ? collisionRect.height - newRect.height : 0,
              };
        const rectCoordinates = {
          x: newRect.left,
          y: newRect.top,
        };

        const newCoordinates =
          offset.x && offset.y
            ? rectCoordinates
            : subtract(rectCoordinates, offset);

        return newCoordinates;
      }
    }
  }

  return undefined;
};

function isSameContainer(a: DroppableContainer, b: DroppableContainer) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }

  return (
    a.data.current.sortable.containerId === b.data.current.sortable.containerId
  );
}

function isAfter(a: DroppableContainer, b: DroppableContainer) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }

  if (!isSameContainer(a, b)) {
    return false;
  }

  return a.data.current.sortable.index < b.data.current.sortable.index;
}
