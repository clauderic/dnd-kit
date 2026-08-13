import {
  Axes,
  type Axis,
  type BoundingRectangle,
  type Coordinates,
} from '@dnd-kit/geometry';
import type {DragOperation, Draggable, Droppable} from '@dnd-kit/abstract';

import {getFrameTransformedScrollPosition} from './getFrameTransformedScrollPosition.ts';
import {getAxisInversionState} from './getAxisInversionState.ts';
import type {ScrollPosition} from './getScrollPosition.ts';

export enum ScrollDirection {
  Idle = 0,
  Forward = 1,
  Reverse = -1,
}

export interface ScrollActivation {
  direction: Record<Axis, ScrollDirection>;
  intensity: Record<Axis, number>;
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

export type ScrollIntentDetector = (
  ctx: ScrollIntentDetectorContext,
  options?: ScrollIntentDetectorOptions
) => ScrollIntent;

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

  const activation = detectActivation(
    pointer,
    scrollPosition.rect,
    options?.threshold,
    options?.tolerance
  );
  const suppressed = suppressOpposingIntent(activation, requestedDirection);
  const resolved = applyAcceleration(suppressed, options?.acceleration);
  const flipped = applyAxisInversion(resolved, inverted);

  return stopAtBoundaries(flipped, scrollPosition);
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

export function detectActivation(
  pointer: Coordinates,
  rect: BoundingRectangle,
  threshold: Record<Axis, number> = defaultThreshold,
  tolerance: Record<Axis, number> = defaultTolerance
): ScrollActivation {
  const direction: Record<Axis, ScrollDirection> = {
    x: ScrollDirection.Idle,
    y: ScrollDirection.Idle,
  };
  const intensity: Record<Axis, number> = {x: 0, y: 0};
  
  const band = {x: rect.width * threshold.x, y: rect.height * threshold.y};
  const within = {
    x:
      pointer.x >= rect.left - tolerance.x &&
      pointer.x <= rect.right + tolerance.x,
    y:
      pointer.y >= rect.top - tolerance.y &&
      pointer.y <= rect.bottom + tolerance.y,
  };

  if (band.y > 0 && pointer.y <= rect.top + band.y && within.x) {
    direction.y = ScrollDirection.Reverse;
    intensity.y = Math.abs((rect.top + band.y - pointer.y) / band.y);
  } else if (band.y > 0 && pointer.y >= rect.bottom - band.y && within.x) {
    direction.y = ScrollDirection.Forward;
    intensity.y = Math.abs((rect.bottom - band.y - pointer.y) / band.y);
  }

  if (band.x > 0 && pointer.x >= rect.right - band.x && within.y) {
    direction.x = ScrollDirection.Forward;
    intensity.x = Math.abs((rect.right - band.x - pointer.x) / band.x);
  } else if (band.x > 0 && pointer.x <= rect.left + band.x && within.y) {
    direction.x = ScrollDirection.Reverse;
    intensity.x = Math.abs((rect.left + band.x - pointer.x) / band.x);
  }

  return {direction, intensity};
}

export function suppressOpposingIntent(
  activation: ScrollActivation,
  requestedDirection?: Record<Axis, ScrollDirection>
): ScrollActivation {
  if (!requestedDirection) {
    return activation;
  }

  const direction = {...activation.direction};
  const intensity = {...activation.intensity};

  for (const axis of Axes) {
    const current = direction[axis];

    if (
      current !== ScrollDirection.Idle &&
      requestedDirection[axis] === invert(current)
    ) {
      direction[axis] = ScrollDirection.Idle;
      intensity[axis] = 0;
    }
  }

  return {direction, intensity};
}

export function applyAcceleration(
  activation: ScrollActivation,
  acceleration: number = defaultAcceleration
): ScrollIntent {
  const {direction, intensity} = activation;
  const speed: Record<Axis, number> = {
    x: intensity.x * acceleration,
    y: intensity.y * acceleration,
  };

  return {direction, speed};
}

export function applyAxisInversion(
  intent: ScrollIntent,
  inverted: Record<Axis, boolean>
): ScrollIntent {
  const {direction, speed} = intent;

  return {
    direction: {
      x: inverted.x ? invert(direction.x) : direction.x,
      y: inverted.y ? invert(direction.y) : direction.y,
    },
    speed,
  };
}

function invert(direction: ScrollDirection): ScrollDirection {
  switch (direction) {
    case ScrollDirection.Forward:
      return ScrollDirection.Reverse;
    case ScrollDirection.Reverse:
      return ScrollDirection.Forward;
    case ScrollDirection.Idle:
      return ScrollDirection.Idle;
  }
}

export function stopAtBoundaries(
  intent: ScrollIntent,
  scrollPosition: ScrollPosition
): ScrollIntent {
  const direction = {...intent.direction};
  const speed = {...intent.speed};
  const atStart = {x: scrollPosition.isLeft, y: scrollPosition.isTop};
  const atEnd = {x: scrollPosition.isRight, y: scrollPosition.isBottom};

  for (const axis of Axes) {
    const blocked =
      (direction[axis] === ScrollDirection.Forward && atEnd[axis]) ||
      (direction[axis] === ScrollDirection.Reverse && atStart[axis]);

    if (blocked) {
      direction[axis] = ScrollDirection.Idle;
      speed[axis] = 0;
    }
  }

  return {direction, speed};
}
