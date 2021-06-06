import type {Coordinates} from '../../types';

/**
 * Returns the distance between two points
 */
export function distanceBetween(p1: Coordinates, p2: Coordinates) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
