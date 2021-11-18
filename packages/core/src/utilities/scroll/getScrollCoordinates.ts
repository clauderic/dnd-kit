import {isWindow} from '@dnd-kit/utilities';

import type {Coordinates} from '../../types';

export function getScrollCoordinates(
  element: Element | typeof window
): Coordinates {
  if (isWindow(element)) {
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
