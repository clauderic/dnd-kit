import type {UniqueIdentifier} from './other';

export type Coordinates = {
  x: number;
  y: number;
};

export type Translate = Coordinates;

export interface LayoutRect {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}

export interface ViewRect extends LayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ClientRect extends ViewRect {}

export type LayoutRectEntry = [UniqueIdentifier, LayoutRect];

export interface ScrollCoordinates {
  initial: Coordinates;
  current: Coordinates;
  delta: Coordinates;
}
