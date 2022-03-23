import type {ClientRect, Modifier} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

import {MAX_DRAWER_HEIGHT_PERCENT} from './constants';

export const rubberbandModifier: Modifier = ({
  draggingNodeRect,
  transform,
  windowRect,
}) => {
  if (!draggingNodeRect || !windowRect) {
    return transform;
  }

  return rubberbandBoundingRect(transform, draggingNodeRect, {
    ...windowRect,
    top: (1 - MAX_DRAWER_HEIGHT_PERCENT) * windowRect.height,
    height: MAX_DRAWER_HEIGHT_PERCENT * windowRect.height,
  });
};

function rubberbandBoundingRect(
  transform: Transform,
  rect: ClientRect,
  boundingRect: ClientRect
): Transform {
  const value = {
    ...transform,
  };

  // Dragging above the top edge of the bounding box
  if (rect.top + transform.y <= boundingRect.top) {
    const min = boundingRect.top - rect.top;
    const max = min + rect.height;

    value.y = rubberbandIfOutOfBounds(transform.y, min, max);
  }
  // Dragging below the bottom edge of the bounding box
  else if (
    rect.bottom + transform.y >=
    boundingRect.top + boundingRect.height
  ) {
    const boundingRectBottom = boundingRect.top + boundingRect.height;
    const min = boundingRectBottom - rect.bottom;
    const max = min - rect.height;

    value.y = rubberbandIfOutOfBounds(transform.y, max, min);
  }

  // Draging beyond the left edge of the bounding box
  if (rect.left + transform.x <= boundingRect.left) {
    const min = boundingRect.left - rect.left;
    const max = min + rect.width;

    value.x = rubberbandIfOutOfBounds(transform.x, min, max);
  }
  // Draging beyond the right edge of the bounding box
  else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
    const boundingRectRight = boundingRect.left + boundingRect.width;
    const min = boundingRectRight - rect.right;
    const max = min - rect.width;

    value.x = rubberbandIfOutOfBounds(transform.x, max, min);
  }

  return value;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

function rubberbandIfOutOfBounds(
  position: number,
  min: number,
  max: number,
  elasticity = 0.3
) {
  if (elasticity === 0) return clamp(position, min, max);
  if (position < min)
    return -rubberband(min - position, max - min, elasticity) + min;
  if (position > max)
    return +rubberband(position - max, max - min, elasticity) + max;
  return position;
}

function rubberband(distance: number, dimension: number, elasticity: number) {
  if (dimension === 0 || Math.abs(dimension) === Infinity)
    return Math.pow(distance, elasticity * 5);
  return (
    (distance * dimension * elasticity) / (dimension + elasticity * distance)
  );
}
