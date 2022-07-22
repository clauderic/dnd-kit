import { CollisionDetection, DroppableContainer } from '@dnd-kit/core';
import { sortBy } from 'lodash';

export const verticalSortableListCollisionDetection: CollisionDetection = (
  args
) => {
  if (args.collisionRect.top < (args.active.rect.current?.initial?.top ?? 0)) {
    return highestDroppableContainerMajorityCovered(args);
  } else {
    return lowestDroppableContainerMajorityCovered(args);
  }
};

// Look for the first (/ furthest up / highest) droppable container that is at least
// 50% covered by the top edge of the dragging container.
const highestDroppableContainerMajorityCovered: CollisionDetection = ({
  droppableContainers,
  collisionRect,
}) => {
  const ascendingDroppabaleContainers = sortBy(
    droppableContainers,
    (c) => c?.rect.current?.top
  );

  for (const droppableContainer of ascendingDroppabaleContainers) {
    const {
      rect: { current: droppableRect },
    } = droppableContainer;

    if (droppableRect) {
      const coveredPercentage =
        (droppableRect.top + droppableRect.height - collisionRect.top) /
        droppableRect.height;

      if (coveredPercentage > 0.5) {
        return [collision(droppableContainer)];
      }
    }
  }

  // if we haven't found anything then we are off the top, so return the first item
  return [collision(ascendingDroppabaleContainers[0])];
};

// Look for the last (/ furthest down / lowest) droppable container that is at least
// 50% covered by the bottom edge of the dragging container.
const lowestDroppableContainerMajorityCovered: CollisionDetection = ({
  droppableContainers,
  collisionRect,
}) => {
  const descendingDroppabaleContainers = sortBy(
    droppableContainers,
    (c) => c?.rect.current?.top
  ).reverse();

  for (const droppableContainer of descendingDroppabaleContainers) {
    const {
      rect: { current: droppableRect },
    } = droppableContainer;

    if (droppableRect) {
      const coveredPercentage =
        (collisionRect.bottom - droppableRect.top) / droppableRect.height;

      if (coveredPercentage > 0.5) {
        return [collision(droppableContainer)];
      }
    }
  }

  // if we haven't found anything then we are off the bottom, so return the last item
  return [collision(descendingDroppabaleContainers[0])];
};

const collision = (dropppableContainer?: DroppableContainer) => {
  return {
    id: dropppableContainer?.id ?? '',
    value: dropppableContainer,
  };
};
