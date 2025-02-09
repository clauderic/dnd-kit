import {CollisionPriority, CollisionType} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point, Rectangle} from '@dnd-kit/geometry';

/**
 * Returns the distance between the corners of the droppable shape and the drag operation shape.
 */
export const closestCorners: CollisionDetector = (input) => {
  const {dragOperation, droppable} = input;
  const {shape, position} = dragOperation;

  if (!droppable.shape) {
    return null;
  }

  const shapeCorners = shape
    ? Rectangle.from(shape.current.boundingRectangle).corners
    : undefined;
  const distance = Rectangle.from(
    droppable.shape.boundingRectangle
  ).corners.reduce(
    (acc, corner, index) =>
      acc +
      Point.distance(
        Point.from(corner),
        shapeCorners?.[index] ?? position.current
      ),
    0
  );
  const value = distance / 4;

  return {
    id: droppable.id,
    value: 1 / value,
    type: CollisionType.Collision,
    priority: CollisionPriority.Normal,
  };
};
