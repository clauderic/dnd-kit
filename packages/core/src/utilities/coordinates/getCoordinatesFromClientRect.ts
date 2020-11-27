import {Coordinates, PositionalClientRect} from '../../types';
import {defaultCoordinates} from './constants';

export function getCoordinatesFromClientRect(
  clientRect: PositionalClientRect | null
): Coordinates {
  if (!clientRect) {
    return defaultCoordinates;
  }

  return {
    x: clientRect.offsetLeft,
    y: clientRect.offsetTop,
  };
}
