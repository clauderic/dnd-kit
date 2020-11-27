import type {UniqueIdentifier} from './other';

export type Coordinates = {
  x: number;
  y: number;
};

export type Translate = Coordinates;

export interface PositionalClientRect extends ClientRect {
  offsetLeft: number;
  offsetTop: number;
}

export type PositionalClientRectEntry = [
  UniqueIdentifier,
  PositionalClientRect
];

export interface ScrollCoordinates {
  initial: Coordinates;
  current: Coordinates;
  delta: Coordinates;
}
