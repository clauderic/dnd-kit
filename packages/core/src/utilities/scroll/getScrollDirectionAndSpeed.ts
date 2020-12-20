import {Direction, ViewRect} from '../../types';
import {getScrollPosition} from './getScrollPosition';
import {isDocumentScrollingElement} from './documentScrollingElement';

export function getScrollDirectionAndSpeed(
  scrollContainer: Element,
  scrollContainerRect: ViewRect,
  rect: ViewRect,
  acceleration = 10
) {
  const {clientHeight, clientWidth} = scrollContainer;
  const finalScrollContainerRect = isDocumentScrollingElement(scrollContainer)
    ? {
        top: 0,
        left: 0,
        right: clientWidth,
        bottom: clientHeight,
      }
    : scrollContainerRect;
  const {isTop, isBottom, isLeft, isRight} = getScrollPosition(scrollContainer);
  const {width, height, left, top, bottom, right} = rect;
  const direction = {
    x: 0,
    y: 0,
  };
  const speed = {
    x: 0,
    y: 0,
  };

  if (!isTop && top <= finalScrollContainerRect.top + height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y =
      acceleration *
      Math.abs((top - height - finalScrollContainerRect.top) / height);
  } else if (!isBottom && bottom >= finalScrollContainerRect.bottom - height) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y =
      acceleration *
      Math.abs((finalScrollContainerRect.bottom - height - bottom) / height);
  }

  if (!isRight && right >= finalScrollContainerRect.right - width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x =
      acceleration *
      Math.abs((finalScrollContainerRect.right - width - right) / width);
  } else if (!isLeft && left <= finalScrollContainerRect.left + width) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x =
      acceleration *
      Math.abs((left - width - finalScrollContainerRect.left) / width);
  }

  return {
    direction,
    speed,
  };
}
