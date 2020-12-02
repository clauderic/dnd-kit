import {PositionalClientRect} from '../../types';
import {getMaxValueIndex} from '../getValueIndex';

import {CollisionDetection} from './types';

/**
 * Returns the intersecting rectangle area between two rectangles
 */
function getIntersectionRatio(
  entry: PositionalClientRect,
  target: PositionalClientRect
): number {
  const top = Math.max(target.top, entry.offsetTop);
  const left = Math.max(target.left, entry.offsetLeft);
  const right = Math.min(
    target.left + target.width,
    entry.offsetLeft + entry.width
  );
  const bottom = Math.min(
    target.top + target.height,
    entry.offsetTop + entry.height
  );
  const width = right - left;
  const height = bottom - top;

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio =
      intersectionArea / (targetArea + entryArea - intersectionArea);

    return Number(intersectionRatio.toFixed(4));
  }

  // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
  return 0;
}

/**
 * Returns the rectangle that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const rectIntersection: CollisionDetection = (entries, target) => {
  const intersections = entries.map(([_, entry]) =>
    getIntersectionRatio(entry, target)
  );

  const maxValueIndex = getMaxValueIndex(intersections);

  if (intersections[maxValueIndex] <= 0) {
    return null;
  }

  return entries[maxValueIndex] ? entries[maxValueIndex][0] : null;
};
