import type {Coordinates} from '../../types';

export type Axis = 'x' | 'y' | 'xy';

export function getAxisDelta(delta: Coordinates, axis: Axis = 'xy'): number {
  switch (axis) {
    case 'x':
      return Math.abs(delta.x);
    case 'y':
      return Math.abs(delta.y);
    case 'xy':
    default:
      return Math.sqrt(delta.x ** 2 + delta.y ** 2);
  }
}
