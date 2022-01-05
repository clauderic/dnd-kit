import type {ClientRect} from '../../types';
import {distanceBetween} from '../coordinates';

import type {Collision, CollisionDetection} from './types';
import {sortCollisionsAsc} from './helpers';

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
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */
export const closestCorners: CollisionDetection = ({
  collisionRect,
  droppableContainers,
}) => {
  const corners = cornersOfRectangle(
    collisionRect,
    collisionRect.left,
    collisionRect.top
  );
  const collisions: Collision[] = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id,
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const rectCorners = cornersOfRectangle(rect, rect.left, rect.top);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));

      collisions.push([id, effectiveDistance]);
    }
  }

  return collisions.sort(sortCollisionsAsc);
};
