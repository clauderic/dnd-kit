import type {LayoutRect, UniqueIdentifier, ViewRect} from '../../types';

import type {CollisionDetection} from './types';

/**
 * Returns the intersecting rectangle area between two rectangles
 */
function getIntersectionRatio(entry: LayoutRect, target: ViewRect): number {
  const top = Math.max(target.top, entry.offsetTop);
  const left = Math.max(target.left, entry.offsetLeft);
  const right = Math.min(
    target.left + target.width,
    entry.offsetLeft + entry.width
  );
  const bottom = Math.min(
    target.top + target.height,
    entry.offsetTop + entry.height
  );
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
 * Returns the rectangle that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */
export const rectIntersection: CollisionDetection = ({
  collisionRect,
  droppableContainers,
}) => {
  let maxIntersectionRatio = 0;
  let maxIntersectingDroppableContainer: UniqueIdentifier | null = null;

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {current: rect},
    } = droppableContainer;

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      if (intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = intersectionRatio;
        maxIntersectingDroppableContainer = droppableContainer.id;
      }
    }
  }

  return maxIntersectingDroppableContainer;
};
