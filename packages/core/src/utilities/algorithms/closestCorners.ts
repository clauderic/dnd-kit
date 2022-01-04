import type {ClientRect, UniqueIdentifier} from '../../types';
import {distanceBetween} from '../coordinates';

import type {CollisionDetection} from './types';

/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */

function cornersOfRectangle(
  rect: ClientRect,
  left = rect.left,
  top = rect.top
) {
  return [
    {
      x: left,
      y: top,
    },
    {
      x: left + rect.width,
      y: top,
    },
    {
      x: left,
      y: top + rect.height,
    },
    {
      x: left + rect.width,
      y: top + rect.height,
    },
  ];
}

/**
 * Returns the closest rectangle from an array of rectangles to the corners of
 * another rectangle.
 */
export const closestCorners: CollisionDetection = ({
  collisionRect,
  droppableContainers,
}) => {
  let minDistanceToCorners = Infinity;
  let minDistanceContainer: UniqueIdentifier | null = null;
  const corners = cornersOfRectangle(
    collisionRect,
    collisionRect.left,
    collisionRect.top
  );

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const rectCorners = cornersOfRectangle(rect, rect.left, rect.top);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));

      if (effectiveDistance < minDistanceToCorners) {
        minDistanceToCorners = effectiveDistance;
        minDistanceContainer = droppableContainer.id;
      }
    }
  }

  return minDistanceContainer;
};
