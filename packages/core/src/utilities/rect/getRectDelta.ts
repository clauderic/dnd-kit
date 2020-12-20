import type {Coordinates, ViewRect} from '../../types';
import {defaultCoordinates} from '../coordinates';

export function getRectDelta(
  rect1: ViewRect | null,
  rect2: ViewRect | null
): Coordinates {
  return rect1 && rect2
    ? {
        x: rect1.left - rect2.left,
        y: rect1.top - rect2.top,
      }
    : defaultCoordinates;
}
