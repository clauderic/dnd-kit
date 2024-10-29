import {Point} from '@dnd-kit/geometry';
import {getFrameElement} from './getFrameElement.ts';

export function getFrameOffset(el: Element | undefined) {
  const offset: Point = {
    x: 0,
    y: 0,
  };

  if (!el) {
    return offset;
  }

  let frame = getFrameElement(el);

  while (frame) {
    const rect = frame.getBoundingClientRect();

    offset.x = offset.x + rect.left;
    offset.y = offset.y + rect.top;

    frame = getFrameElement(frame);
  }

  return offset;
}
