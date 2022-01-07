import type {Modifier} from '@dnd-kit/core';
import {getEventCoordinates} from '@dnd-kit/utilities';

export const snapCenterToCursor: Modifier = ({
  activatorEvent,
  activeNodeRect,
  transform,
}) => {
  if (activeNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);

    if (!activatorCoordinates) {
      return transform;
    }

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
