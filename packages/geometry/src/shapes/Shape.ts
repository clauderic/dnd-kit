import type {Point} from '../point';
import type {BoundingRectangle} from '../types';

/**
 * A shape is 2D geometrical object, such as a polygon or circle.
 * A shape is used for collision detection. You can create a shape however you
 * like. Shapes may encapsulate one or more child shapes.
 */
export abstract class Shape {
  abstract translate(x: number, y: number): Shape;

  abstract get boundingRectangle(): BoundingRectangle;

  abstract get centroid(): Point;

  abstract get area(): number;

  abstract get scale(): {x: number; y: number};

  abstract intersectionArea(shape: Shape): number;

  /**
   * Test a point for containment in this shape. This only works for convex
   * shapes.
   *
   * @param point A point in world coordinates.
   */
  abstract containsPoint(point: Point): boolean;
}

export type ShapeConstructor = new (...args: any[]) => Shape;
