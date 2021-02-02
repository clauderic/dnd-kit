import {
  closestCorners,
  getViewRect,
  KeyboardCode,
  RectEntry,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {subtract as getCoordinatesDelta} from '@dnd-kit/utilities';

import type {SensorContext} from './types';
import {getProjectedDepth} from './utilities';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right];

export const sortableTreeKeyboardCoordinates: (
  context: SensorContext,
  step: number
) => KeyboardCoordinateGetter = (context, step) => (
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

    if (horizontal.includes(event.code)) {
      const {depth, maxDepth, minDepth} = getProjectedDepth(
        items,
        active,
        over.id,
        offset,
        step
      );

      switch (event.code) {
        case KeyboardCode.Left:
          if (depth > minDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x - step,
            };
          }
          break;
        case KeyboardCode.Right:
          if (depth < maxDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x + step,
            };
          }
          break;
      }

      return undefined;
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
          if (translatedRect.top < rect.top) {
            layoutRects.push([id, rect]);
          }
          break;
        case KeyboardCode.Up:
          if (translatedRect.top > rect.top) {
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
        const newItem = items.find(({id}) => id === closestId);
        const activeItem = items.find(({id}) => id === active);
        const {depth} = getProjectedDepth(
          items,
          active,
          closestId,
          (newItem.depth - activeItem.depth) * step,
          step
        );

        const newCoordinates = getCoordinatesDelta({
          x: newRect.left + (depth - activeItem.depth) * step,
          y: newRect.top - (translatedRect.height - newRect.height),
        });

        return newCoordinates;
      }
    }
  }

  return undefined;
};
