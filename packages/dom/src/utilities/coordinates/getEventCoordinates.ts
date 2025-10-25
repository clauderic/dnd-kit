import {type Coordinates} from '@dnd-kit/geometry';

export function getEventCoordinates(event: PointerEvent): Coordinates {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}
