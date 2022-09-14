import type {Coordinates} from '../types';

/**
 * A Point represents a location in a two-dimensional coordinate system.
 *
 */
export class Point implements Coordinates {
  /**
   * @param {number} Coordinate of the point on the horizontal axis
   * @param {number} Coordinate of the point on the vertical axis
   */
  constructor(public x: number, public y: number) {}

  /**
   * Returns the delta between this point and another point.
   *
   * @param {Point} a - A point
   * @param {Point} b - Another point
   */
  static delta(a: Point, b: Point): Point {
    return new Point(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns the distance (hypotenuse) between this point and another point.
   *
   * @param {Point} a - A point
   * @param {Point} b - Another point
   */
  static distance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns true if both points are equal.
   *
   * @param {Point} a - A point
   * @param {Point} b - Another point
   */
  static equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  static from({x, y}: Coordinates) {
    return new Point(x, y);
  }
}
