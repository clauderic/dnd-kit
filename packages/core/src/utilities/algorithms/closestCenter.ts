import {distanceBetween} from '../coordinates';
import type {Coordinates, LayoutRect} from '../../types';
import type {CollisionDetection} from './types';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
function centerOfRectangle(
  rect: LayoutRect,
  left = rect.offsetLeft,
  top = rect.offsetTop
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

/**
 * Returns the closest rectangle from an array of rectangles to the center of a given
 * rectangle.
 */
export const closestCenter: CollisionDetection = ({
  draggingNode: {rect: draggableViewRect},
  droppableContainers,
}) => {
  const centerRect = centerOfRectangle(
    draggableViewRect,
    draggableViewRect.left,
    draggableViewRect.top
  );
  let minDistanceToCenter = Infinity;
  let minDroppableContainer;

  for (let i = 0; i < droppableContainers.length; i++) {
    const curContainer = droppableContainers[i];
    const curRect = curContainer.rect.current;
    if (curRect) {
      const distBetween = distanceBetween(
        centerOfRectangle(curRect),
        centerRect
      );
      if (distBetween < minDistanceToCenter) {
        minDistanceToCenter = distBetween;
        minDroppableContainer = curContainer;
      }
    }
  }

  return minDroppableContainer ? minDroppableContainer.id : null;
};
