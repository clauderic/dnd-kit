import {
  closestCorners,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';

export const CustomCollisionDetection = (
  overContainerIds: string[],
  overIdsPerContainer: Record<string, string[]>
): CollisionDetection => (rects, rect) => {
  // no containers, fallback to normal
  if (!overContainerIds.length) {
    return closestCorners(rects, rect);
  }

  // determine closest container
  const containerRects = rects.filter(([id]) => overContainerIds.includes(id));
  const closestContainerId = containerRects.length
    ? rectIntersection(containerRects, rect)
    : null;

  // BAIL: not inside a container
  if (!closestContainerId) {
    return null;
  }

  // filter out rects that aren't inside the closest container
  const filteredRects = rects.filter(([id]) =>
    overIdsPerContainer[closestContainerId].includes(id)
  );

  // get the closest intersecting rect
  const closestRectId = closestCorners(filteredRects, rect);

  // if none intersect, return container
  return closestRectId || closestContainerId;
};
