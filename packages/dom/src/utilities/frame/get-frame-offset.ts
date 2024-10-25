import {Point} from '@dnd-kit/geometry';
import {getFrameElement} from './get-frame-element.ts';

export function getFrameOffset(el: Element) {
  const offset: Point = {
    x: 0,
    y: 0,
  };

  let frame = getFrameElement(el);

  while (frame) {
    const rect = frame.getBoundingClientRect();

    offset.x = offset.x + rect.left;
    offset.y = offset.y + rect.top;

    frame = getFrameElement(frame);
  }

  return offset;
}
