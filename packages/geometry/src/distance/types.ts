import type {Axis, Coordinates} from '../types';

export type Distance =
  | number
  | Coordinates
  | Pick<Coordinates, Axis.Horizontal>
  | Pick<Coordinates, Axis.Vertical>;
