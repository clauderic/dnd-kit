import type {Modifier} from '@dnd-kit/core';
import {getEventCoordinates} from '@dnd-kit/core';

export const snapCenterToCursor: Modifier = ({
  activatorEvent,
  activeNodeRect,
  transform,
}) => {
  if (
    activatorEvent &&
    !(activatorEvent instanceof KeyboardEvent) &&
    activeNodeRect
  ) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);
    const offsetX = activatorCoordinates.x - activeNodeRect.left;
    const offsetY = activatorCoordinates.y - activeNodeRect.top;

    return {
      ...transform,
      x: transform.x + offsetX - activeNodeRect.width / 2,
      y: transform.y + offsetY - activeNodeRect.height / 2,
    };
  }

  return transform;
};
