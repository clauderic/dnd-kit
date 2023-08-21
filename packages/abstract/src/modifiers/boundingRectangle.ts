import type {BoundingRectangle, Coordinates, Shape} from '@dnd-kit/geometry';

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
