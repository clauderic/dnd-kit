import {getMinValueIndex} from '../other';
import {distanceBetween} from '../coordinates';
import {isViewRect} from '../rect';
import type {LayoutRect} from '../../types';
import type {CollisionDetection} from './types';

/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */

function cornersOfRectangle(
  rect: LayoutRect,
  left = rect.offsetLeft,
  top = rect.offsetTop
) {
  return [
    {
      x: left,
      y: top,
    },
    {
      x: left + rect.width,
      y: top,
    },
    {
      x: left,
      y: top + rect.height,
    },
    {
      x: left + rect.width,
      y: top + rect.height,
    },
  ];
}

/**
 * Returns the closest rectangle from an array of rectangles to the corners of
 * another rectangle.
 */
export const closestCorners: CollisionDetection = (entries, target) => {
  const corners = cornersOfRectangle(target, target.left, target.top);

  const distances = entries.map(([_, entry]) => {
    const entryCorners = cornersOfRectangle(
      entry,
      isViewRect(entry) ? entry.left : undefined,
      isViewRect(entry) ? entry.top : undefined
    );
    const distances = corners.reduce((accumulator, corner, index) => {
      return accumulator + distanceBetween(entryCorners[index], corner);
    }, 0);

    return Number((distances / 4).toFixed(4));
  });

  const minValueIndex = getMinValueIndex(distances);

  return entries[minValueIndex] ? entries[minValueIndex][0] : null;
};
