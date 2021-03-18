import {Direction, Coordinates, ViewRect} from '../../types';
import {getScrollPosition} from './getScrollPosition';
import {isDocumentScrollingElement} from './documentScrollingElement';

export function getScrollDirectionAndSpeed(
  scrollContainer: Element,
  scrollContainerRect: ViewRect,
  {x, y}: Coordinates,
  acceleration = 10
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
    height: finalScrollContainerRect.height * 0.2,
    width: finalScrollContainerRect.width * 0.2,
  };

  if (!isTop && y <= finalScrollContainerRect.top + threshold.height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y =
      acceleration *
      Math.abs(
        (threshold.height - (finalScrollContainerRect.top + y)) /
          threshold.height
      );
  } else if (
    !isBottom &&
    y >= finalScrollContainerRect.bottom - threshold.height
  ) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (threshold.height - (finalScrollContainerRect.bottom - y)) /
          threshold.height
      );
  }

  if (!isRight && x >= finalScrollContainerRect.right - threshold.width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (threshold.width - (finalScrollContainerRect.right - x)) /
          threshold.width
      );
  } else if (!isLeft && x <= finalScrollContainerRect.left + threshold.width) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x =
      acceleration *
      Math.abs(
        (threshold.width - (finalScrollContainerRect.left + x)) /
          threshold.width
      );
  }

  return {
    direction,
    speed,
  };
}
