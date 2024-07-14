import {CollisionPriority, CollisionType} from '@dnd-kit/abstract';
import type {CollisionDetector} from '@dnd-kit/abstract';
import {Point} from '@dnd-kit/geometry';

/**
 * A high precision collision detection algorithm that detects
 * whether the pointer intersects with a given droppable element.
 *
 * Returns the distance between the pointer coordinates and the center of the
 * droppable element if the pointer is within the droppable element.
 *
 * Returns null if the pointer is outside of the droppable element.
 */
export const pointerIntersection: CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  const pointerCoordinates = dragOperation.position.current;

  if (!pointerCoordinates) {
    return null;
  }

  const {id} = droppable;

  if (!droppable.shape) {
    return null;
  }

  if (droppable.shape.containsPoint(pointerCoordinates)) {
    /* There may be more than a single rectangle intersecting
     * with the pointer coordinates. In order to sort the
     * colliding rectangles, we measure the distance between
     * the pointer and the center of the intersecting rectangle
     */
    const distance = Point.distance(droppable.shape.center, pointerCoordinates);

    return {
      id,
      value: 1 / distance,
      type: CollisionType.PointerIntersection,
      priority: CollisionPriority.High,
    };
  }

  return null;
};
