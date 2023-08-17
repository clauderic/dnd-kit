import type {Point} from '../point';
import type {BoundingRectangle} from '../types';

/**
 * An abstract class representing a 2D geometric shape, such as
 * a polygon or circle. Shapes are used for collision detection
 * during drag and drop operations.
 */
export abstract class Shape {
  /**
   * Get the bounding rectangle of the 2D shape.
   * @returns The bounding rectangle of the shape.
   */
  abstract get boundingRectangle(): BoundingRectangle;

  /**
   * Get the center point of the 2D shape.
   * @returns The center point of the shape.
   */
  abstract get center(): Point;

  /**
   * Get the total space taken up by the 2D shape.
   * @returns The area of the shape.
   */
  abstract get area(): number;

  /**
   * Get the scale transformation of the shape on the 2D plane.
   * @returns The scale of the shape.
   */
  abstract get scale(): {x: number; y: number};

  /**
   * Get the inverse scale transformation of the shape on the 2D plane.
   * @returns The inverse scale of the shape.
   */
  abstract get inverseScale(): {x: number; y: number};

  /**
   * Returns whether or not this shape is equal to another shape.
   *
   * @param shape The other shape to compare with.
   * @returns Whether or not the two shapes are equal.
   */
  abstract equals(shape: Shape): boolean;

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
