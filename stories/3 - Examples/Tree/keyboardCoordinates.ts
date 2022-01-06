import {
  closestCorners,
  getClientRect,
  getFirstCollision,
  KeyboardCode,
  KeyboardCoordinateGetter,
  DroppableContainer,
} from '@dnd-kit/core';

import type {SensorContext} from './types';
import {getProjection} from './utilities';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right];

export const sortableTreeKeyboardCoordinates: (
  context: SensorContext,
  indentationWidth: number
) => KeyboardCoordinateGetter = (context, indentationWidth) => (
  event,
  {
    currentCoordinates,
    context: {active, over, collisionRect, droppableContainers},
  }
) => {
  if (directions.includes(event.code)) {
    if (!active || !collisionRect) {
      return;
    }

    event.preventDefault();

    const {
      current: {items, offset},
    } = context;

    if (horizontal.includes(event.code) && over?.id) {
      const {depth, maxDepth, minDepth} = getProjection(
        items,
        active.id,
        over.id,
        offset,
        indentationWidth
      );

      switch (event.code) {
        case KeyboardCode.Left:
          if (depth > minDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x - indentationWidth,
            };
          }
          break;
        case KeyboardCode.Right:
          if (depth < maxDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x + indentationWidth,
            };
          }
          break;
      }

      return undefined;
    }

    const containers: DroppableContainer[] = [];

    const overRect = over?.id
      ? droppableContainers.get(over.id)?.rect.current
      : undefined;

    if (overRect) {
      droppableContainers.forEach((container) => {
        if (container?.disabled) {
          return;
        }

        const rect = container?.rect.current;

        if (!rect) {
          return;
        }

        switch (event.code) {
          case KeyboardCode.Down:
            if (overRect.top < rect.top) {
              containers.push(container);
            }
            break;
          case KeyboardCode.Up:
            if (overRect.top > rect.top) {
              containers.push(container);
            }
            break;
        }
      });
    }

    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
      pointerCoordinates: null,
      droppableContainers: containers,
    });
    const closestId = getFirstCollision(collisions, 'id');

    if (closestId && over?.id) {
      const newNode = droppableContainers.get(closestId)?.node.current;
      const activeNodeRect = droppableContainers.get(active.id)?.rect.current;

      if (newNode && activeNodeRect) {
        const newRect = getClientRect(newNode, {ignoreTransform: true});
        const newItem = items.find(({id}) => id === closestId);
        const activeItem = items.find(({id}) => id === active.id);

        if (newItem && activeItem) {
          const {depth} = getProjection(
            items,
            active.id,
            closestId,
            (newItem.depth - activeItem.depth) * indentationWidth,
            indentationWidth
          );
          const offset =
            newRect.top > activeNodeRect.top
              ? Math.abs(activeNodeRect.height - newRect.height)
              : 0;

          const newCoordinates = {
            x: newRect.left + depth * indentationWidth,
            y: newRect.top + offset,
          };

          return newCoordinates;
        }
      }
    }
  }

  return undefined;
};
