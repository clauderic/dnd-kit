import type {Axis, BoundingRectangle, Coordinates} from '@dnd-kit/geometry';

import {getScrollPosition} from './getScrollPosition';

export enum ScrollDirection {
  Idle = 0,
  Forward = 1,
  Reverse = -1,
}

const defaultThreshold: Record<Axis, number> = {
  x: 0.2,
  y: 0.2,
};

interface ScrollIntent {
  x: ScrollDirection;
  y: ScrollDirection;
}

export function shouldScroll(
  scrollableElement: Element,
  coordinates: Coordinates,
  intent?: ScrollIntent,
  acceleration = 10,
  thresholdPercentage = defaultThreshold
) {
  const {
    rect: scrollContainerRect,
    isTop,
    isBottom,
    isLeft,
    isRight,
  } = getScrollPosition(scrollableElement);

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
    coordinates.y <= scrollContainerRect.top + threshold.height &&
    intent?.y !== ScrollDirection.Forward
  ) {
    // Scroll Up
    direction.y = ScrollDirection.Reverse;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.top + threshold.height - coordinates.y) /
          threshold.height
      );
  } else if (
    !isBottom &&
    coordinates.y >= scrollContainerRect.bottom - threshold.height &&
    intent?.y !== ScrollDirection.Reverse
  ) {
    // Scroll Down
    direction.y = ScrollDirection.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.bottom - threshold.height - coordinates.y) /
          threshold.height
      );
  }

  if (
    !isRight &&
    coordinates.x >= scrollContainerRect.right - threshold.width &&
    intent?.x !== ScrollDirection.Reverse
  ) {
    // Scroll Right
    direction.x = ScrollDirection.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.right - threshold.width - coordinates.x) /
          threshold.width
      );
  } else if (
    !isLeft &&
    coordinates.x <= scrollContainerRect.left + threshold.width &&
    intent?.x !== ScrollDirection.Forward
  ) {
    // Scroll Left
    direction.x = ScrollDirection.Reverse;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.left + threshold.width - coordinates.x) /
          threshold.width
      );
  }

  return {
    direction,
    speed,
  };
}
