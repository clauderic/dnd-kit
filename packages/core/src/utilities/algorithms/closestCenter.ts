import {getMinValueIndex} from '../other';
import {centerOfRectangle, distanceBetween} from '../coordinates';
import type {CollisionDetection} from './types';

/**
 * Returns the closest rectangle from an array of rectangles to the center of a given
 * rectangle.
 */
export const closestCenter: CollisionDetection = (rects, rect) => {
  const centerRect = centerOfRectangle(rect, rect.left, rect.top);
  const distances = rects.map(([_, rect]) =>
    distanceBetween(centerOfRectangle(rect), centerRect)
  );

  const minValueIndex = getMinValueIndex(distances);

  return rects[minValueIndex] ? rects[minValueIndex][0] : null;
};
