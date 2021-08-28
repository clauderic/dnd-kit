import type {Coordinates} from './types';
import {isTouchEvent} from '../event';

/**
 * Returns the normalized x and y coordinates for mouse and touch events.
 */
export function getEventCoordinates(event: Event): Coordinates {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {clientX: x, clientY: y} = event.touches[0];

      return {
        x,
        y,
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {clientX: x, clientY: y} = event.changedTouches[0];

      return {
        x,
        y,
      };
    }
  }

  // In case of MouseEvent or PointerEvent.
  if ('clientX' in event && 'clientY' in event) {
    return {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY,
    };
  }

  return {
    x: 0,
    y: 0,
  };
}
