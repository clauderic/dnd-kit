import type {Collision, CollisionDetection} from './types';
import {getIntersectionRatio, sortCollisionsDesc} from './helpers';

/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const rectIntersection: CollisionDetection = ({
  collisionRect,
  droppableContainers,
}) => {
  const collisions: Collision[] = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id,
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      if (intersectionRatio > 0) {
        collisions.push([id, intersectionRatio]);
      }
    }
  }

  return collisions.sort(sortCollisionsDesc);
};
