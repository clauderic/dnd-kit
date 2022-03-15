import type {Coordinates, ClientRect} from '../../types';
import {distanceBetween} from '../coordinates';

import type {CollisionDescriptor, CollisionDetection} from './types';
import {cornersOfRectangle, sortCollisionsAsc} from './helpers';

/**
 * Check if a given point is contained within a bounding rectangle
 */
function isPointWithinRect(point: Coordinates, rect: ClientRect): boolean {
  const {top, left, bottom, right} = rect;

  return (
    top <= point.y && point.y <= bottom && left <= point.x && point.x <= right
  );
}

/**
 * Returns the rectangles that the pointer is hovering over
 */
export const pointerWithin: CollisionDetection = ({
  droppableContainers,
  droppableRects,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect && isPointWithinRect(pointerCoordinates, rect)) {
      /* There may be more than a single rectangle intersecting
       * with the pointer coordinates. In order to sort the
       * colliding rectangles, we measure the distance between
       * the pointer and the corners of the intersecting rectangle
       */
      const corners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner) => {
        return accumulator + distanceBetween(pointerCoordinates, corner);
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
