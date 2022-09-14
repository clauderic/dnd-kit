import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const pointerIntersection: CollisionDetector = ({
  pointerCoordinates,
  droppable,
}) => {
  if (!pointerCoordinates) {
    return null;
  }

  const {id} = droppable;

  if (!droppable.shape) {
    return null;
  }

  if (droppable.shape.containsPoint(pointerCoordinates)) {
    /* There may be more than a single rectangle intersecting
     * with the pointer coordinates. In order to sort the
     * colliding rectangles, we measure the distance between
     * the pointer and the center of the intersecting rectangle
     */
    const value = Point.distance(droppable.shape.centroid, pointerCoordinates);

    return {
      id,
      value,
      priority: CollisionPriority.High,
    };
  }

  return null;
};
