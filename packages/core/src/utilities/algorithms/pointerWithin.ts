import type {Coordinates, ClientRect} from '../../types';
import type {CollisionDetection} from './types';

/**
 * check if the given point is within the rectangle
 */
function isPointerInside(
  entry: ClientRect,
  pointerCoordinates: Coordinates
): boolean {
  const {top, left, bottom, right} = entry;

  return (
    top <= pointerCoordinates.y &&
    pointerCoordinates.y <= bottom &&
    left <= pointerCoordinates.x &&
    pointerCoordinates.x <= right
  );
}

/**
 * Returns the rectangle that the pointer is hovering over
 */
export const pointerWithin: CollisionDetection = ({
  droppableContainers,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) return null;

  for (const droppableContainer of droppableContainers) {
    const {
      rect: {current: rect},
    } = droppableContainer;

    if (rect && isPointerInside(rect, pointerCoordinates)) {
      return droppableContainer.id;
    }
  }

  return null;
};
