import {CollisionPriority} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

/**
 * Returns the distance between the droppable shape and the drag operation coordinates.
 */
export const pointerDistance: CollisionDetector = (input) => {
  const {dragOperation, droppable} = input;
  const {position} = dragOperation;

  if (!droppable.shape) {
    return null;
  }

  const distance = Point.distance(droppable.shape.center, position.current);
  const value = 1 / distance;

  return {
    id: droppable.id,
    value,
    priority: CollisionPriority.Low,
  };
};
