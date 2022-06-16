import type {DroppableContainer} from '../../store';
import type {CollisionDetection} from './types';

/**
 * Returns the droppableContainer to swap with in a vertical list
 */
export const verticalSortableList: CollisionDetection = (args) => {
  if (
    args.collisionRect.top < (args.active.rect.current?.initial?.offsetTop ?? 0)
  ) {
    return highestDroppableContainerMajorityCovered(args);
  } else {
    return lowestDroppableContainerMajorityCovered(args);
  }
};

/** Look for the first (/ furthest up / highest) droppable container that is at least
 * 50% covered by the top edge of the dragging container.
 */
const highestDroppableContainerMajorityCovered: CollisionDetection = (args) => {
  const ascendingDroppabaleContainers = [
    ...args.droppableContainers.sort((c) => c?.rect.current?.offsetTop),
  ];

  for (const droppableContainer of ascendingDroppabaleContainers) {
    const {
      rect: {current: droppableRect},
    } = droppableContainer;

    if (droppableRect) {
      const coveredPercentage =
        (droppableRect.offsetTop +
          droppableRect.height -
          args.collisionRect.top) /
        droppableRect.height;

      if (coveredPercentage > 0.5) {
        return [collision(droppableContainer)];
      }
    }
  }

  // if we haven't found anything then we are off the top, so return the first item
  return [collision(ascendingDroppabaleContainers[0])];
};

/* Look for the last (/ furthest down / lowest) droppable container that is at least
 * 50% covered by the bottom edge of the dragging container.
 */
const lowestDroppableContainerMajorityCovered: CollisionDetection = (args) => {
  const descendingDroppabaleContainers = [
    ...args.droppableContainers.sort((c) => c?.rect.current?.offsetTop),
  ].reverse();

  for (const droppableContainer of descendingDroppabaleContainers) {
    const {
      rect: {current: droppableRect},
    } = droppableContainer;

    if (droppableRect) {
      const coveredPercentage =
        (args.collisionRect.bottom - droppableRect.offsetTop) /
        droppableRect.height;

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
