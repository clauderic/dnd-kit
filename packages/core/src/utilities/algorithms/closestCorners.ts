import {distanceBetween} from '../coordinates';

import type {CollisionDescriptor, CollisionDetection} from './types';
import {cornersOfRectangle, sortCollisionsAsc} from './helpers';

/**
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */
export const closestCorners: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
}) => {
  const corners = cornersOfRectangle(collisionRect);
  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const rectCorners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));

      collisions.push({
        id,
        data: {droppableContainer, value: effectiveDistance},
      });
    }
  }

  return collisions.sort(sortCollisionsAsc);
};
