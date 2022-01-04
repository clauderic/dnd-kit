import {Direction, ClientRect} from '../../types';
import {getScrollPosition} from './getScrollPosition';
import {isDocumentScrollingElement} from './documentScrollingElement';

interface PositionalCoordinates
  extends Pick<ClientRect, 'top' | 'left' | 'right' | 'bottom'> {}

const defaultThreshold = {
  x: 0.2,
  y: 0.2,
};

export function getScrollDirectionAndSpeed(
  scrollContainer: Element,
  scrollContainerRect: ClientRect,
  {top, left, right, bottom}: PositionalCoordinates,
  acceleration = 10,
  thresholdPercentage = defaultThreshold
) {
  const {clientHeight, clientWidth} = scrollContainer;
  const finalScrollContainerRect = isDocumentScrollingElement(scrollContainer)
    ? {
        top: 0,
        left: 0,
        right: clientWidth,
        bottom: clientHeight,
        width: clientWidth,
        height: clientHeight,
      }
    : scrollContainerRect;
  const {isTop, isBottom, isLeft, isRight} = getScrollPosition(scrollContainer);

  const direction = {
    x: 0,
    y: 0,
  };
  const speed = {
    x: 0,
    y: 0,
  };
  const threshold = {
    height: finalScrollContainerRect.height * thresholdPercentage.y,
    width: finalScrollContainerRect.width * thresholdPercentage.x,
  };

  if (!isTop && top <= finalScrollContainerRect.top + threshold.height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.top + threshold.height - top) /
          threshold.height
      );
  } else if (
    !isBottom &&
    bottom >= finalScrollContainerRect.bottom - threshold.height
  ) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.bottom - threshold.height - bottom) /
          threshold.height
      );
  }

  if (!isRight && right >= finalScrollContainerRect.right - threshold.width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.right - threshold.width - right) /
          threshold.width
      );
  } else if (
    !isLeft &&
    left <= finalScrollContainerRect.left + threshold.width
  ) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.left + threshold.width - left) /
          threshold.width
      );
  }

  return {
    direction,
    speed,
  };
}
