import type {LayoutRect, ViewRect} from '../../types';
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
  draggingNode: {rect: draggableViewRect},
  droppableContainers,
}) => {
  let maxIntersectionRatio = 0;
  let maxIntersectingDroppableContainer;

  for (let i = 0; i < droppableContainers.length; i++) {
    const curContainer = droppableContainers[i];
    const curRect = curContainer.rect.current;
    if (curRect) {
      const intersectionRatio = getIntersectionRatio(
        curRect,
        draggableViewRect
      );
      if (intersectionRatio > maxIntersectionRatio) {
        maxIntersectionRatio = intersectionRatio;
        maxIntersectingDroppableContainer = curContainer;
      }
    }
  }

  return maxIntersectingDroppableContainer
    ? maxIntersectingDroppableContainer.id
    : null;
};
