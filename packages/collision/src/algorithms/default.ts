import type {CollisionDetector} from '@dnd-kit/abstract';

import {pointerIntersection} from './pointerIntersection.js';
import {shapeIntersection} from './shapeIntersection.js';

/**
 * Returns the droppable that has the greatest intersection area with the
 * pointer coordinates. If there are no pointer coordinates, or the pointer
 * is not intersecting with any droppable, return the greatest intersection area
 * between the collision shape and other intersecting droppable shapes.
 */
export const defaultCollisionDetection: CollisionDetector = (args) => {
  return pointerIntersection(args) ?? shapeIntersection(args);
};
