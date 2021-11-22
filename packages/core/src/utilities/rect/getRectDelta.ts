import type {Coordinates, ClientRect} from '../../types';
import {defaultCoordinates} from '../coordinates';

export function getRectDelta(
  rect1: ClientRect | null,
  rect2: ClientRect | null
): Coordinates {
  return rect1 && rect2
    ? {
        x: rect1.left - rect2.left,
        y: rect1.top - rect2.top,
      }
    : defaultCoordinates;
}
