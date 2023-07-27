import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';

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

  if (intersectionArea) {
    return {
      id: droppable.id,
      value: intersectionArea,
      priority: CollisionPriority.Medium,
    };
  }

  return null;
};
