import type {Coordinates} from '../types';

import type {Distance} from './types';

/**
 * Returns true if a set of relative coordinates exceeds a given distance.
 */
export function exceedsDistance(
  {x, y}: Coordinates,
  distance: Distance
): boolean {
  const dx = Math.abs(x);
  const dy = Math.abs(y);

  if (typeof distance === 'number') {
    return Math.sqrt(dx ** 2 + dy ** 2) > distance;
  }

  if ('x' in distance && 'y' in distance) {
    return dx > distance.x && dy > distance.y;
  }

  if ('x' in distance) {
    return dx > distance.x;
  }

  if ('y' in distance) {
    return dy > distance.y;
  }

  return false;
}
