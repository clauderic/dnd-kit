import {
  closestCorners,
  getViewRect,
  KeyboardCode,
  RectEntry,
  KeyboardCoordinateGetter,
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
    active,
    currentCoordinates,
    context: {over, translatedRect, droppableContainers},
  }
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!translatedRect) {
      return;
    }

    const {
      current: {items, offset},
    } = context;

    if (horizontal.includes(event.code) && over?.id) {
      const {depth, maxDepth, minDepth} = getProjection(
        items,
        active,
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

    const layoutRects: RectEntry[] = [];

    const overRect = over?.id
      ? droppableContainers[over.id]?.rect.current
      : undefined;

    Object.entries(droppableContainers).forEach(([id, container]) => {
      if (container?.disabled || !overRect) {
        return;
      }

      const rect = container?.rect.current;

      if (!rect) {
        return;
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (overRect.offsetTop < rect.offsetTop) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Up:
          if (overRect.offsetTop > rect.offsetTop) {
            layoutRects.push([id, rect]);
          }
          break;
      }
    });

    const closestId = closestCorners(layoutRects, translatedRect);

    if (closestId && over?.id) {
      const newNode = droppableContainers[closestId]?.node.current;
      const activeNodeRect = droppableContainers[active]?.rect.current;

      if (newNode && activeNodeRect) {
        const newRect = getViewRect(newNode);
        const newItem = items.find(({id}) => id === closestId);
        const activeItem = items.find(({id}) => id === active);

        if (newItem && activeItem) {
          const {depth} = getProjection(
            items,
            active,
            closestId,
            (newItem.depth - activeItem.depth) * indentationWidth,
            indentationWidth
          );
          const offset =
            newRect.offsetTop > activeNodeRect.offsetTop
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
