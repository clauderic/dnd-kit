import type {Axis, Coordinates} from '@dnd-kit/geometry';
import type {DragOperation, Draggable, Droppable} from '@dnd-kit/abstract';

import {getFrameTransformedScrollPosition} from './getFrameTransformedScrollPosition.ts';
import {getAxisInversionState} from './getAxisInversionState.ts';
import type {ScrollPosition} from './getScrollPosition.ts';

export enum ScrollDirection {
  Idle = 0,
  Forward = 1,
  Reverse = -1,
}

export interface ScrollIntentDetectorContext {
  element: Element;
  scrollPosition: ScrollPosition;
  pointer: Coordinates;
  inverted: Record<Axis, boolean>;
  operation?: DragOperation<Draggable, Droppable>;
  requestedDirection?: Record<Axis, ScrollDirection>;
}

export interface ScrollIntentDetectorOptions {
  acceleration?: number;
  threshold?: Record<Axis, number>;
  tolerance?: Record<Axis, number>;
}

export interface ScrollIntent {
  direction: Record<Axis, ScrollDirection>;
  speed: Record<Axis, number>;
}

const defaultAcceleration = 25;

const defaultThreshold: Record<Axis, number> = {
  x: 0.2,
  y: 0.2,
};

const defaultTolerance: Record<Axis, number> = {
  x: 10,
  y: 10,
};

/**
 * The default scroll intent detector.
 *
 * Scrolls when the pointer enters the activation zones near the container's edges.
 */
export function detectScrollIntent(
  ctx: ScrollIntentDetectorContext,
  options?: ScrollIntentDetectorOptions
): ScrollIntent;

/**
 * The default scroll intent detector.
 *
 * Scrolls when the pointer enters the activation zones near the container's edges.
 *
 * @deprecated Pass a `ScrollIntentDetectorContext` instead. The positional signature is
 * kept for backward compatibility and will be removed in a future release.
 */
export function detectScrollIntent(
  scrollableElement: Element,
  coordinates: Coordinates,
  requestedDirection?: Record<Axis, ScrollDirection>,
  acceleration?: number,
  thresholdPercentage?: Record<Axis, number>,
  tolerance?: Record<Axis, number>
): ScrollIntent;

export function detectScrollIntent(
  ctxOrElement: ScrollIntentDetectorContext | Element,
  coordinatesOrOptions?: Coordinates | ScrollIntentDetectorOptions,
  requestedDirection?: Record<Axis, ScrollDirection>,
  acceleration?: number,
  thresholdPercentage?: Record<Axis, number>,
  tolerance?: Record<Axis, number>
): ScrollIntent {
  if (isScrollIntentDetectorContext(ctxOrElement)) {
    return detectScrollIntentImpl(
      ctxOrElement,
      coordinatesOrOptions as ScrollIntentDetectorOptions | undefined
    );
  }

  const ctx: ScrollIntentDetectorContext = {
    element: ctxOrElement,
    scrollPosition: getFrameTransformedScrollPosition(ctxOrElement),
    inverted: getAxisInversionState(ctxOrElement),
    pointer: coordinatesOrOptions as Coordinates,
    requestedDirection,
  };

  return detectScrollIntentImpl(ctx, {
    acceleration,
    threshold: thresholdPercentage,
    tolerance,
  });
}

function detectScrollIntentImpl(
  ctx: ScrollIntentDetectorContext,
  options?: ScrollIntentDetectorOptions
): ScrollIntent {
  const {pointer, scrollPosition, inverted, requestedDirection} = ctx;
  const {
    rect: scrollContainerRect,
    isTop,
    isLeft,
    isBottom,
    isRight,
  } = scrollPosition;
  const {x, y} = pointer;
  const {x: isXAxisInverted, y: isYAxisInverted} = inverted;

  const acceleration = options?.acceleration ?? defaultAcceleration;
  const thresholdPercentage = options?.threshold ?? defaultThreshold;
  const tolerance = options?.tolerance ?? defaultTolerance;

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
    threshold.height > 0 &&
    (!isTop || (isYAxisInverted && !isBottom)) &&
    y <= scrollContainerRect.top + threshold.height &&
    requestedDirection?.y !== ScrollDirection.Forward &&
    x >= scrollContainerRect.left - tolerance.x &&
    x <= scrollContainerRect.right + tolerance.x
  ) {
    // Scroll Up (or Down if inverted)
    direction.y = isYAxisInverted
      ? ScrollDirection.Forward
      : ScrollDirection.Reverse;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.top + threshold.height - y) / threshold.height
      );
  } else if (
    threshold.height > 0 &&
    (!isBottom || (isYAxisInverted && !isTop)) &&
    y >= scrollContainerRect.bottom - threshold.height &&
    requestedDirection?.y !== ScrollDirection.Reverse &&
    x >= scrollContainerRect.left - tolerance.x &&
    x <= scrollContainerRect.right + tolerance.x
  ) {
    // Scroll Down (or Up if inverted)
    direction.y = isYAxisInverted
      ? ScrollDirection.Reverse
      : ScrollDirection.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (scrollContainerRect.bottom - threshold.height - y) / threshold.height
      );
  }

  if (
    threshold.width > 0 &&
    (!isRight || (isXAxisInverted && !isLeft)) &&
    x >= scrollContainerRect.right - threshold.width &&
    requestedDirection?.x !== ScrollDirection.Reverse &&
    y >= scrollContainerRect.top - tolerance.y &&
    y <= scrollContainerRect.bottom + tolerance.y
  ) {
    // Scroll Right (or Left if inverted)
    direction.x = isXAxisInverted
      ? ScrollDirection.Reverse
      : ScrollDirection.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (scrollContainerRect.right - threshold.width - x) / threshold.width
      );
  } else if (
    threshold.width > 0 &&
    (!isLeft || (isXAxisInverted && !isRight)) &&
    x <= scrollContainerRect.left + threshold.width &&
    requestedDirection?.x !== ScrollDirection.Forward &&
    y >= scrollContainerRect.top - tolerance.y &&
    y <= scrollContainerRect.bottom + tolerance.y
  ) {
    // Scroll Left (or Right if inverted)
    direction.x = isXAxisInverted
      ? ScrollDirection.Forward
      : ScrollDirection.Reverse;
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

function isScrollIntentDetectorContext(
  value: ScrollIntentDetectorContext | Element
): value is ScrollIntentDetectorContext {
  return (
    'element' in value &&
    'scrollPosition' in value &&
    'pointer' in value &&
    'inverted' in value
  );
}
