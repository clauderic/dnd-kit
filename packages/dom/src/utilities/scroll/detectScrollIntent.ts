import {Rectangle, type Axis, type Coordinates} from '@dnd-kit/geometry';

import {getScrollPosition} from './getScrollPosition.ts';
import {getFrameTransform} from '../frame/getFrameTransform.ts';

export enum ScrollDirection {
  Idle = 0,
  Forward = 1,
  Reverse = -1,
}

const defaultThreshold: Record<Axis, number> = {
  x: 0.2,
  y: 0.2,
};

const defaultTolerance: Record<Axis, number> = {
  x: 10,
  y: 10,
};

interface ScrollIntent {
  x: ScrollDirection;
  y: ScrollDirection;
}

export function detectScrollIntent(
  scrollableElement: Element,
  coordinates: Coordinates,
  intent?: ScrollIntent,
  acceleration = 25,
  thresholdPercentage = defaultThreshold,
  tolerance = defaultTolerance
) {
  const {x, y} = coordinates;
  const {rect, isTop, isBottom, isLeft, isRight} =
    getScrollPosition(scrollableElement);
  const frameTransform = getFrameTransform(scrollableElement);
  const scrollContainerRect = new Rectangle(
    rect.left * frameTransform.scaleX + frameTransform.x,
    rect.top * frameTransform.scaleY + frameTransform.y,
    rect.width * frameTransform.scaleX,
    rect.height * frameTransform.scaleY
  );
  const direction: Record<Axis, ScrollDirection> = {
    x: ScrollDirection.Idle,
    y: ScrollDirection.Idle,
  };
  const speed = {
    x: 0,
    y: 0,
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x,
  };

  if (
    !isTop &&
    y <= scrollContainerRect.top + threshold.height &&
    intent?.y !== ScrollDirection.Forward &&
    x >= scrollContainerRect.left - tolerance.x &&
    x <= scrollContainerRect.right + tolerance.x
  ) {
    // Scroll Up
    direction.y = ScrollDirection.Reverse;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.top + threshold.height - y) / threshold.height
      );
  } else if (
    !isBottom &&
    y >= scrollContainerRect.bottom - threshold.height &&
    intent?.y !== ScrollDirection.Reverse &&
    x >= scrollContainerRect.left - tolerance.x &&
    x <= scrollContainerRect.right + tolerance.x
  ) {
    // Scroll Down
    direction.y = ScrollDirection.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.bottom - threshold.height - y) / threshold.height
      );
  }

  if (
    !isRight &&
    x >= scrollContainerRect.right - threshold.width &&
    intent?.x !== ScrollDirection.Reverse &&
    y >= scrollContainerRect.top - tolerance.y &&
    y <= scrollContainerRect.bottom + tolerance.y
  ) {
    // Scroll Right
    direction.x = ScrollDirection.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.right - threshold.width - x) / threshold.width
      );
  } else if (
    !isLeft &&
    x <= scrollContainerRect.left + threshold.width &&
    intent?.x !== ScrollDirection.Forward &&
    y >= scrollContainerRect.top - tolerance.y &&
    y <= scrollContainerRect.bottom + tolerance.y
  ) {
    // Scroll Left
    direction.x = ScrollDirection.Reverse;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.left + threshold.width - x) / threshold.width
      );
  }

  return {
    direction,
    speed,
  };
}
