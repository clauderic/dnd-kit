import type {BoundingRectangle, Coordinates, Shape} from '@dnd-kit/geometry';

/**
 * Restricts a shape's movement to stay within a bounding rectangle.
 *
 * @param shape - The shape to restrict
 * @param transform - The current transform coordinates
 * @param boundingRect - The bounding rectangle to restrict movement within
 * @returns The modified transform coordinates that keep the shape within bounds
 *
 * @remarks
 * This function:
 * - Prevents the shape from moving outside the bounding rectangle
 * - Adjusts the transform coordinates to keep the shape's edges within bounds
 * - Maintains the shape's position relative to the bounding rectangle
 *
 * @example
 * ```typescript
 * const shape = { boundingRectangle: { top: 0, left: 0, right: 100, bottom: 100 } };
 * const transform = { x: 50, y: 50 };
 * const bounds = { top: 0, left: 0, width: 200, height: 200 };
 *
 * const restricted = restrictShapeToBoundingRectangle(shape, transform, bounds);
 * ```
 */
export function restrictShapeToBoundingRectangle(
  shape: Shape,
  transform: Coordinates,
  boundingRect: BoundingRectangle
) {
  const value = {
    ...transform,
  };

  if (shape.boundingRectangle.top + transform.y <= boundingRect.top) {
    value.y = boundingRect.top - shape.boundingRectangle.top;
  } else if (
    shape.boundingRectangle.bottom + transform.y >=
    boundingRect.top + boundingRect.height
  ) {
    value.y =
      boundingRect.top + boundingRect.height - shape.boundingRectangle.bottom;
  }

  if (shape.boundingRectangle.left + transform.x <= boundingRect.left) {
    value.x = boundingRect.left - shape.boundingRectangle.left;
  } else if (
    shape.boundingRectangle.right + transform.x >=
    boundingRect.left + boundingRect.width
  ) {
    value.x =
      boundingRect.left + boundingRect.width - shape.boundingRectangle.right;
  }

  return value;
}
