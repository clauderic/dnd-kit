import type {Coordinates} from '@dnd-kit/geometry';

import {
  getScrollCoordinates,
  getScrollXCoordinate,
  getScrollYCoordinate,
} from './getScrollCoordinates';

export function getScrollOffsets(
  scrollableAncestors: Element[] | null
): Coordinates {
  const defaultCoordinates = {x: 0, y: 0};

  if (!scrollableAncestors) {
    return defaultCoordinates;
  }

  return scrollableAncestors.reduce((acc, node) => {
    const {x, y} = getScrollCoordinates(node);

    return {
      x: acc.x + x,
      y: acc.y + y,
    };
  }, defaultCoordinates);
}

export function getScrollXOffset(scrollableAncestors: Element[]): number {
  return scrollableAncestors.reduce<number>((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}

export function getScrollYOffset(scrollableAncestors: Element[]): number {
  return scrollableAncestors.reduce<number>((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}
