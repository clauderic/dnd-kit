import {Coordinates, PositionalClientRect} from '../../types';
import {getMinValueIndex} from '../getValueIndex';
import {distanceBetween} from '../coordinates';
import {CollisionDetection} from './types';

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
export const closestCenter: CollisionDetection = (rects, rect) => {
  const centerRect = centerOfRectangle(rect, rect.left, rect.top);
  const distances = rects.map(([_, clientRect]) =>
    distanceBetween(centerOfRectangle(clientRect), centerRect)
  );

  const minValueIndex = getMinValueIndex(distances);

  return rects[minValueIndex] ? rects[minValueIndex][0] : null;
};
