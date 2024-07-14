import {Collision} from './types.ts';

/**
 * Sort collisions from greatest to smallest priority
 * Collisions of equal priority are sorted from greatest to smallest value
 */
export function sortCollisions(a: Collision, b: Collision) {
  if (a.priority === b.priority) {
    if (a.type === b.type) {
      return b.value - a.value;
    }

    return b.type - a.type;
  }

  return b.priority - a.priority;
}
