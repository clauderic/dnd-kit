import type {Coordinates, LayoutRect} from '../../types';

/**
 * Returns the coordinates of the center of a given ClientRect
 */
export function centerOfRectangle(
  rect: LayoutRect,
  left = rect.offsetLeft,
  top = rect.offsetTop
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}
