import {distanceBetween} from '../coordinates';
import type {Coordinates, LayoutRect, UniqueIdentifier} from '../../types';

import type {CollisionDetection} from './types';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect: LayoutRect,
  left = rect.offsetLeft,
  top = rect.offsetTop
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

/**
 * Returns the closest rectangle from an array of rectangles to the center of a given
 * rectangle.
 */
export const closestCenter: CollisionDetection = ({
  collisionRect,
  droppableContainers,
}) => {
  const centerRect = centerOfRectangle(
    collisionRect,
    collisionRect.left,
    collisionRect.top
  );
  let minDistanceToCenter = Infinity;
  let minDroppableContainer: UniqueIdentifier | null = null;

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);

      if (distBetween < minDistanceToCenter) {
        minDistanceToCenter = distBetween;
        minDroppableContainer = droppableContainer.id;
      }
    }
  }

  return minDroppableContainer;
};
