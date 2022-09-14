import type {Axis, BoundingRectangle} from '@dnd-kit/geometry';

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

export function getScrollDirectionAndSpeed(
  scrollContainer: Element,
  scrollContainerRect: BoundingRectangle,
  rect: BoundingRectangle,
  acceleration = 10,
  thresholdPercentage = defaultThreshold
) {
  const {top, left, bottom, right} = rect;
  const {isTop, isBottom, isLeft, isRight} = getScrollPosition(scrollContainer);

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

  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    // Scroll Up
    direction.y = ScrollDirection.Reverse;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.top + threshold.height - top) / threshold.height
      );
  } else if (
    !isBottom &&
    bottom >= scrollContainerRect.bottom - threshold.height
  ) {
    // Scroll Down
    direction.y = ScrollDirection.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.bottom - threshold.height - bottom) /
          threshold.height
      );
  }

  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    // Scroll Right
    direction.x = ScrollDirection.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.right - threshold.width - right) / threshold.width
      );
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    // Scroll Left
    direction.x = ScrollDirection.Reverse;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.left + threshold.width - left) / threshold.width
      );
  }

  return {
    direction,
    speed,
  };
}
