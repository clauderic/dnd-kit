import {BoundingRectangle, Coordinates} from '@dnd-kit/geometry';
import {Transform} from './parseTransform.ts';

export function transformCoordinates(
  coordinates: Coordinates,
  transform: Transform,
  boundingRectangle?: BoundingRectangle
): Coordinates {
  const newCoordinates = {
    x: coordinates.x,
    y: coordinates.y,
  };

  newCoordinates.x = newCoordinates.x / transform.scaleX;
  newCoordinates.y = newCoordinates.y / transform.scaleY;

  // Offset the shape by the width and height difference
  if (boundingRectangle) {
    const {width, height} = boundingRectangle;

    // Only offset if getting smaller - other compute already handles the inverse
    if (transform.scaleX < 1 && transform.scaleY < 1) {
      const newWidth = width * transform.scaleX;
      const newHeight = height * transform.scaleY;

      const widthDiff = width - newWidth;
      const heightDiff = height - newHeight;

      newCoordinates.x = newCoordinates.x - widthDiff * 2;
      newCoordinates.y = newCoordinates.y - heightDiff * 2;
    }
  }

  return newCoordinates;
}
