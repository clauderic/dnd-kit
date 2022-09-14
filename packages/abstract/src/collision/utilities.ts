import {Collision} from './types';

/**
 * Sort collisions from greatest to smallest priority
 * Collisions of equal priority are sorted from greatest to smallest value
 */
export function sortCollisions(a: Collision, b: Collision) {
  if (a.priority === b.priority) {
    return b.value - a.value;
  }

  return b.priority - a.priority;
}
