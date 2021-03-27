import type {Coordinates} from '../../types';

export function getScrollCoordinates(
  element: Element | typeof window
): Coordinates {
  if (element instanceof Window) {
    return {
      x: element.scrollX,
      y: element.scrollY,
    };
  }

  return {
    x: element.scrollLeft,
    y: element.scrollTop,
  };
}
