import {getMinValueIndex} from '../other';
import {distanceBetween} from '../coordinates';
import type {Coordinates, LayoutRect} from '../../types';
import type {CollisionDetection} from './types';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect: LayoutRect,
  left = rect.offsetLeft,
  top = rect.offsetTop
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

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
