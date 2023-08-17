import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

/**
 * Returns the droppable with the greatest intersection area with
 * the collision shape.
 */
export const shapeIntersection: CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  if (!droppable.shape) {
    return null;
  }

  const {shape} = dragOperation;
  const intersectionArea = shape?.intersectionArea(droppable.shape);

  // Check if the droppable is intersecting with the drag operation shape.
  if (intersectionArea) {
    const {position} = dragOperation;
    /* There could be multiple droppables intersecting with the drag operation shape,
     * so we need to prioritize the droppable that is the closest to the pointer.
     * We don't use the intersection area for this because it can lead to cyclic
     * collisions.
     */
    const distance = Point.distance(droppable.shape.center, position.current);

    const value = 1 / distance;

    return {
      id: droppable.id,
      value,
      priority: CollisionPriority.Medium,
    };
  }

  return null;
};
