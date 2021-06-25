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
export const closestCorners: CollisionDetection = ({
  draggingNode: {rect: draggableViewRect},
  droppableContainers,
}) => {
  let minDistanceToCorners = Infinity;
  let minDistanceContainer;
  const corners = cornersOfRectangle(
    draggableViewRect,
    draggableViewRect.left,
    draggableViewRect.top
  );

  for (let i = 0; i < droppableContainers.length; i++) {
    const curContainer = droppableContainers[i];
    const curRect = curContainer.rect.current;
    if (curRect) {
      const curRectCorners = cornersOfRectangle(
        curRect,
        isViewRect(curRect) ? curRect.left : undefined,
        isViewRect(curRect) ? curRect.top : undefined
      );
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(curRectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));

      if (effectiveDistance < minDistanceToCorners) {
        minDistanceToCorners = effectiveDistance;
        minDistanceContainer = curContainer;
      }
    }
  }

  return minDistanceContainer ? minDistanceContainer.id : null;
};
