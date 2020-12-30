import {Coordinates} from '../../types';
import {isMouseEvent, isTouchEvent} from '../event';

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

  if (isMouseEvent(event)) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  return {
    x: 0,
    y: 0,
  };
}
