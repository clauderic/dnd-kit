import type {CollisionDetector} from '@dnd-kit/abstract';

import {pointerIntersection} from './pointerIntersection.ts';
import {detectShapeIntersection, isRectangle} from './shapeIntersection.ts';

/**
 * Prefers the smallest rectangular target containing the pointer, falling back
 * to nearby intersecting shapes. A nested target remains more specific than its
 * parent when either resizes; their centers need not remain in the same place.
 * Explicit pointerIntersection detectors retain their center-distance ranking.
 * The rectangular fallback translates the initial drag footprint by the resolved
 * transform. Resizing visual feedback to fit a destination does not change which
 * other destinations it intersects. Explicit shapeIntersection detectors still
 * use the live drag shape.
 */
export const defaultCollisionDetection: CollisionDetector = (args) => {
  const intersection = pointerIntersection(args);
  if (intersection) {
    const target = args.droppable.shape!;
    if (isRectangle(target)) intersection.value = 1 / (1 + target.area);
    return intersection;
  }

  const {shape, transform} = args.dragOperation;
  const query =
    shape && isRectangle(shape.initial)
      ? shape.initial.translate(transform.x, transform.y)
      : shape?.current;

  return detectShapeIntersection(args, query);
};
