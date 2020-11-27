import {getMaxValueIndex} from '../getValueIndex';

import {CollisionDetection} from './types';

/**
 * Returns the intersecting rectangle area between two rectangles
 */
function intersectingRectArea(rect1: ClientRect, rect2: ClientRect): number {
  const left = Math.max(rect1.left, rect2.left);
  const top = Math.max(rect1.top, rect2.top);
  const right = Math.min(rect1.left + rect1.width, rect2.left + rect2.width);
  const bottom = Math.min(rect1.top + rect1.height, rect2.top + rect2.height);
  const width = right - left;
  const height = bottom - top;

  if (left < right && top < bottom) {
    return width * height;
  }

  // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
  return 0;
}

/**
 * Returns the rectangle that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const rectIntersection: CollisionDetection = (rects, rect) => {
  const intersections = rects.map(([_, clientRect]) =>
    intersectingRectArea(clientRect, rect)
  );

  const maxValueIndex = getMaxValueIndex(intersections);

  if (intersections[maxValueIndex] <= 0) {
    return null;
  }

  return rects[maxValueIndex] ? rects[maxValueIndex][0] : null;
};
