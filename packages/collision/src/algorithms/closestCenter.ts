import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

import {defaultCollisionDetection} from './default';

/**
 * Returns the distance between the droppable shape and the drag operation shape.
 */
export const closestCenter: CollisionDetector = (input) => {
  const {dragOperation, droppable} = input;
  const {shape, position} = dragOperation;

  if (!droppable.shape) {
    return null;
  }

  // const collision = defaultCollisionDetection(input);

  // if (collision) {
  //   return collision;
  // }

  const distance = Point.distance(
    droppable.shape.center,
    shape?.center ?? position.current
  );

  const value = 1 / distance;

  return {
    id: droppable.id,
    value,
    priority: CollisionPriority.Low,
  };
};
