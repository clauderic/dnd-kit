import type {Coordinates} from '@dnd-kit/geometry';

import {getScrollPosition} from './getScrollPosition.js';

export function canScroll(scrollableElement: Element, by?: Coordinates) {
  const {isTop, isBottom, isLeft, isRight, position} =
    getScrollPosition(scrollableElement);

  const {x, y} = by ?? {x: 0, y: 0};

  const top = !isTop && position.current.y + y > 0;
  const bottom = !isBottom && position.current.y + y < position.max.y;
  const left = !isLeft && position.current.x + x > 0;
  const right = !isRight && position.current.x + x < position.max.x;

  return {
    top,
    bottom,
    left,
    right,
    x: left || right,
    y: top || bottom,
  };
}
