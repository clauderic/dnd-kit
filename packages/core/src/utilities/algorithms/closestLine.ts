import type {Coordinates} from '../../types';
import type {CollisionDescriptor, CollisionDetection} from './types';

/**
 * Returns the distance of the point from the given line.
 */
const getPointFromLineDistance = (
  point: Coordinates,
  [start, end]: [Coordinates, Coordinates]
): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dot = (point.x - start.x) * dx + (point.y - start.y) * dy;
  const segmentLengthSquared = dx * dx + dy * dy;
  const projection = segmentLengthSquared ? dot / segmentLengthSquared : 0;

  let {x, y} =
    projection <= 0 ? start :
      projection >= 1 ? end :
        {x: start.x + projection * dx, y: start.y + projection * dy};

  const distX = point.x - x;
  const distY = point.y - y;

  return Math.sqrt(distX * distX + distY * distY);
}

/**
 * Returns the closest rectangles from an array of rectangles by the 
 * distance between the pointer and the diagonal of each container.
 */
export const closestLine: CollisionDetection = (
  {
    droppableRects,
    droppableContainers,
    pointerCoordinates,
  }
) => {
  if (!pointerCoordinates?.x || !pointerCoordinates?.y) {
    return [];
  }

  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (!rect) {
      continue;
    }

    const distance = getPointFromLineDistance(
      pointerCoordinates,
      [
        {x: rect.left, y: rect.top},
        {x: rect.left + rect.width, y: rect.top + rect.height}
      ]
    );

    collisions.push({
      id,
      data: {droppableContainer, value: distance}
    });
  }

  return collisions.sort((a, b) => a.data.value - b.data.value);
}

/**
 * Returns the container if the pointer is inside a rectangle else 
 * returns the closest rectangles from an array of rectangles by the 
 * distance between the pointer and the diagonal of each container.
 */
export const containingRectOrClosestLine: CollisionDetection = (
  {
    droppableRects,
    droppableContainers,
    pointerCoordinates,
  }
) => {
  if (!pointerCoordinates?.x || !pointerCoordinates?.y) {
    return [];
  }

  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (!rect) {
      continue;
    }

    if (rect.width > 1 && rect.height > 1) {
      const {x, y} = pointerCoordinates;

      if (
        x <= rect.left + rect.width &&
        x >= rect.left &&
        y <= rect.top + rect.height &&
        y >= rect.top
      ) {
        return [{id, data: {droppableContainer, value: 0}}];
      }
    } else {
      const distance = getPointFromLineDistance(
        pointerCoordinates,
        [
          {x: rect.left, y: rect.top},
          {x: rect.left + rect.width, y: rect.top + rect.height}
        ]
      );

      collisions.push({id, data: {droppableContainer, value: distance}});
    }
  }

  return collisions.sort((a, b) => a.data.value - b.data.value);
}