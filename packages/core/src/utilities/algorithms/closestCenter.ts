import type {Coordinates, ClientRect} from '../../types';

import {closestPoint} from './helpers';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(rect: ClientRect): Coordinates {
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top + rect.height * 0.5,
  };
}

/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
 * rectangle.
 */
export const closestCenter = closestPoint(centerOfRectangle);
