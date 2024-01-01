import type {Coordinates, ClientRect} from '../../types';

import {closestPoint} from './helpers';

function topCenter(rect: ClientRect): Coordinates {
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top,
  };
}

function leftCenter(rect: ClientRect): Coordinates {
  return {
    x: rect.left,
    y: rect.top + rect.width * 0.5,
  };
}

function rightCenter(rect: ClientRect): Coordinates {
  return {
    x: rect.right,
    y: rect.top + rect.width * 0.5,
  };
}

function bottomCenter(rect: ClientRect): Coordinates {
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.bottom,
  };
}

/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
 * rectangle.
 */
export const closestEdge = {
  top: closestPoint(topCenter, bottomCenter),
  left: closestPoint(leftCenter, rightCenter),
  right: closestPoint(rightCenter, leftCenter),
  bottom: closestPoint(bottomCenter, topCenter),
};
