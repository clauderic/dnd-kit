import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

import {defaultCollisionDetection} from './default.ts';

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

  const {center, boundingRectangle} = shape.current;

  if (
    (direction === 'down' &&
      boundingRectangle.bottom >= droppable.shape.center.y) ||
    (direction === 'up' && boundingRectangle.top <= droppable.shape.center.y) ||
    (direction === 'left' &&
      boundingRectangle.left <= droppable.shape.center.x) ||
    (direction === 'right' &&
      boundingRectangle.right >= droppable.shape.center.x)
  ) {
    return {
      id: droppable.id,
      value: 1 / Point.distance(droppable.shape.center, center),
      priority: CollisionPriority.Normal,
    };
  }

  return null;
};
