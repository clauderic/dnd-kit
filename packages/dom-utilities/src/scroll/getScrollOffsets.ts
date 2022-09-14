import type {Coordinates} from '@dnd-kit/geometry';
import {add} from '@dnd-kit/utilities';

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
    return add(acc, getScrollCoordinates(node));
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
