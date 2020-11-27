import {Direction, PositionalClientRect} from '../types';
import {getScrollPosition} from './getScrollPosition';

export function getScrollDirectionAndSpeed(
  scrollContainer: Element,
  scrollContainerRect: PositionalClientRect,
  clientRect: PositionalClientRect,
  acceleration = 10
) {
  const {clientHeight, clientWidth} = scrollContainer;
  const isWindowScrollContainer = scrollContainer === document.scrollingElement;
  const finalScrollContainerRect = isWindowScrollContainer
    ? {
        top: 0,
        left: 0,
        right: clientWidth,
        bottom: clientHeight,
      }
    : scrollContainerRect;
  const {isTop, isBottom, isLeft, isRight} = getScrollPosition(scrollContainer);
  const {width, height} = clientRect;
  const direction = {
    x: 0,
    y: 0,
  };
  const speed = {
    x: 0,
    y: 0,
  };

  if (!isTop && clientRect.top <= finalScrollContainerRect.top + height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y =
      acceleration *
      Math.abs(
        (clientRect.top - height - finalScrollContainerRect.top) / height
      );
  } else if (
    !isBottom &&
    clientRect.bottom >= finalScrollContainerRect.bottom - height
  ) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.bottom - height - clientRect.bottom) / height
      );
  }

  if (!isRight && clientRect.right >= finalScrollContainerRect.right - width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x =
      acceleration *
      Math.abs(
        (finalScrollContainerRect.right - width - clientRect.right) / width
      );
  } else if (
    !isLeft &&
    clientRect.left <= finalScrollContainerRect.left + width
  ) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x =
      acceleration *
      Math.abs(
        (clientRect.left - width - finalScrollContainerRect.left) / width
      );
  }

  return {
    direction,
    speed,
  };
}
