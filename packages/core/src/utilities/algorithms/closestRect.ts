import {Coordinates, PositionalClientRect} from '../../types';
import {getMinValueIndex} from '../getValueIndex';

import {CollisionDetection} from './types';

/**
 * Returns the distance between two points
 */
function distanceBetween(p1: Coordinates, p2: Coordinates) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect: PositionalClientRect,
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
export const closestRect: CollisionDetection = (rects, rect) => {
  const centerRect = centerOfRectangle(rect, rect.left, rect.top);
  const distances = rects.map(([_, clientRect]) =>
    distanceBetween(centerOfRectangle(clientRect), centerRect)
  );

  const minValueIndex = getMinValueIndex(distances);

  return rects[minValueIndex] ? rects[minValueIndex][0] : null;
};
