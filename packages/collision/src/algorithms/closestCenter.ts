import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

import {defaultCollisionDetection} from './default';

/**
 * Returns the closest droppable shape to the pointer coordinates.
 * In the absence of pointer coordinates, return the closest shape to the
 * collision shape.
 */
export const closestCenter: CollisionDetector = (input) => {
  const {shape, pointerCoordinates, droppable} = input;

  if (!droppable.shape) {
    return null;
  }

  const collision = defaultCollisionDetection(input);

  if (collision) {
    return collision;
  }

  const distance = Point.distance(
    droppable.shape.centroid,
    pointerCoordinates ?? shape.centroid
  );

  const value = 1 / distance;

  return {
    id: droppable.id,
    value,
    priority: CollisionPriority.Low,
  };
};
