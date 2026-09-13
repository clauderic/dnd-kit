import {CollisionPriority, CollisionType} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point, Rectangle, type Shape} from '@dnd-kit/geometry';

/**
 * Finds intersecting droppables, preferring those nearest the pointer.
 */
export const shapeIntersection: CollisionDetector = (input) =>
  detectShapeIntersection(input, input.dragOperation.shape?.current);

/** Shared implementation; the default detector supplies its logical drag shape. */
export function detectShapeIntersection(
  {dragOperation, droppable}: Parameters<CollisionDetector>[0],
  shape: Shape | undefined
) {
  const target = droppable.shape;

  if (!target || !shape) {
    return null;
  }

  const intersectionArea = shape.intersectionArea(target);

  // Check if the droppable is intersecting with the drag operation shape.
  if (intersectionArea) {
    const {position} = dragOperation;
    const {current: point} = position;
    // The area and center of an auto-sized container change when a card enters
    // it. Its nearest edge does not, so a placement cannot undo itself merely
    // because the container became taller. Keep exact shape intersection above;
    // non-rectangular shapes retain their own geometry and center-distance rank.
    const distance = isRectangle(target)
      ? Math.hypot(
          Math.max(target.left - point.x, 0, point.x - target.right),
          Math.max(target.top - point.y, 0, point.y - target.bottom)
        )
      : Point.distance(target.center, point);

    const value = 1 / (1 + distance);

    return {
      id: droppable.id,
      value,
      type: CollisionType.ShapeIntersection,
      priority: CollisionPriority.Normal,
    };
  }

  return null;
}

// DOMRectangle inherits these exact geometry operations. A custom subclass may
// represent a different shape even though it also has a bounding rectangle.
export function isRectangle(shape: Shape): shape is Rectangle {
  return (
    shape instanceof Rectangle &&
    shape.intersectionArea === Rectangle.prototype.intersectionArea &&
    shape.containsPoint === Rectangle.prototype.containsPoint
  );
}
