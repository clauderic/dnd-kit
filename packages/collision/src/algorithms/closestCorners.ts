import {CollisionPriority, CollisionType} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

/**
 * Returns the distance between the corners of the droppable shape and the drag operation shape.
 */
export const closestCorners: CollisionDetector = (input) => {
  const {dragOperation, droppable} = input;
  const {shape, position} = dragOperation;

  if (!droppable.shape) {
    return null;
  }

  const {left, top, right, bottom} = droppable.shape.boundingRectangle;
  const corners = [
    {
      x: left,
      y: top,
    },
    {
      x: right,
      y: top,
    },
    {
      x: left,
      y: bottom,
    },
    {
      x: right,
      y: bottom,
    },
  ];

  const distance = corners.reduce(
    (acc, corner) =>
      acc +
      Point.distance(
        Point.from(corner),
        shape?.current.center ?? position.current
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
