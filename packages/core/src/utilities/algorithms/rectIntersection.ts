import type {ClientRect} from '../../types';

import type {CollisionDescriptor, CollisionDetection} from './types';
import {sortCollisionsDesc} from './helpers';

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

/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const rectIntersection: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
}) => {
  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {droppableContainer, value: intersectionRatio},
        });
      }
    }
  }

  return collisions.sort(sortCollisionsDesc);
};
