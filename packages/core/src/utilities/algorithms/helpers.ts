import type {ClientRect} from '../../types';

import type {Collision} from './types';

export function sortCollisionsAsc([, a]: Collision, [, b]: Collision) {
  return a - b;
}

export function sortCollisionsDesc([, a]: Collision, [, b]: Collision) {
  return b - a;
}

/**
 * Returns the intersecting rectangle area between two rectangles
 */
export function getIntersectionRatio(
  entry: ClientRect,
  target: ClientRect
): number {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
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
