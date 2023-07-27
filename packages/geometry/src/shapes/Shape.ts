import type {Point} from '../point';
import type {BoundingRectangle} from '../types';

/**
 * An abstract class representing a 2 dimensional geometric shape,
 * such as a polygon or circle. Shapes are used for collision detection
 * during drag and drop operations
 */
export abstract class Shape {
  abstract get boundingRectangle(): BoundingRectangle;

  abstract get center(): Point;

  abstract get area(): number;

  abstract get scale(): {x: number; y: number};

  /**
   * Returns the intersection area between this shape and another shape.
   *
   * @param shape The other shape to calculate the intersection area with.
   * @returns The intersection area between the two shapes.
   */
  abstract intersectionArea(shape: Shape): number;

  /**
   * Test a point for containment within this shape.
   *
   * @param point A point in world coordinates.
   */
  abstract containsPoint(point: Point): boolean;
}
