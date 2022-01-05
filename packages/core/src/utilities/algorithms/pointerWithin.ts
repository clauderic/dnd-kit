import type {Coordinates, ClientRect} from '../../types';

import type {Collision, CollisionDetection} from './types';
import {getIntersectionRatio, sortCollisionsDesc} from './helpers';

/**
 * check if the given point is within the rectangle
 */
function isPointerInside(
  entry: ClientRect,
  pointerCoordinates: Coordinates
): boolean {
  const {top, left, bottom, right} = entry;

  return (
    top <= pointerCoordinates.y &&
    pointerCoordinates.y <= bottom &&
    left <= pointerCoordinates.x &&
    pointerCoordinates.x <= right
  );
}

/**
 * Returns the rectangles that the pointer is hovering over
 */
export const pointerWithin: CollisionDetection = ({
  droppableContainers,
  collisionRect,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const collisions: Collision[] = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id,
      rect: {current: rect},
    } = droppableContainer;

    if (rect && isPointerInside(rect, pointerCoordinates)) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      collisions.push([id, intersectionRatio]);
    }
  }

  return collisions.sort(sortCollisionsDesc);
};
