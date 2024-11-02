import {Point} from '@dnd-kit/geometry';
import {getFrameElement} from './getFrameElement.ts';

export function getFrameOffset(
  el: Element | undefined,
  boundary: Element | null = window.frameElement
): Point {
  const offset: Point = {
    x: 0,
    y: 0,
  };

  if (!el) return offset;

  let frame = getFrameElement(el);

  while (frame) {
    if (frame === boundary) {
      return offset;
    }

    const rect = frame.getBoundingClientRect();

    offset.x = offset.x + rect.left;
    offset.y = offset.y + rect.top;

    frame = getFrameElement(frame);
  }

  return offset;
}
