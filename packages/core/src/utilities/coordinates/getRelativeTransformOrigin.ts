import {getEventCoordinates} from '@dnd-kit/utilities';

export function getRelativeTransformOrigin(
  event: MouseEvent | TouchEvent | KeyboardEvent,
  rect: ClientRect
) {
  if (event instanceof KeyboardEvent) {
    return '0 0';
  }

  const eventCoordinates = getEventCoordinates(event);
  const transformOrigin = {
    x: ((eventCoordinates.x - rect.left) / rect.width) * 100,
    y: ((eventCoordinates.y - rect.top) / rect.height) * 100,
  };

  return `${transformOrigin.x}% ${transformOrigin.y}%`;
}
