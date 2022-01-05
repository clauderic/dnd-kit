import {distanceBetween} from '../coordinates';
import type {Coordinates, ClientRect} from '../../types';

import type {Collision, CollisionDetection} from './types';
import {sortCollisionsAsc} from './helpers';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect: ClientRect,
  left = rect.left,
  top = rect.top
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
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
  const collisions: Collision[] = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id,
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);

      collisions.push([id, distBetween]);
    }
  }

  return collisions.sort(sortCollisionsAsc);
};
