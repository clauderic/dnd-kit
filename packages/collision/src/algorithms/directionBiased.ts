import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

import {defaultCollisionDetection} from './default';

export const directionBiased: CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  if (!droppable.shape) {
    return null;
  }

  const {position, shape} = dragOperation;
  const {direction} = position;

  if (!shape) {
    return null;
  }

  if (direction === null) {
    return defaultCollisionDetection({dragOperation, droppable});
  }

  if (
    (direction === 'down' &&
      shape.boundingRectangle.bottom >= droppable.shape.center.y) ||
    (direction === 'up' &&
      shape.boundingRectangle.top <= droppable.shape.center.y) ||
    (direction === 'left' &&
      shape.boundingRectangle.left <= droppable.shape.center.x) ||
    (direction === 'right' &&
      shape.boundingRectangle.right >= droppable.shape.center.x)
  ) {
    return {
      id: droppable.id,
      value: 1 / Point.distance(droppable.shape.center, shape.center),
      priority: CollisionPriority.Medium,
    };
  }

  return null;
};
