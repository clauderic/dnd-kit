import {getFrameElement} from './getFrameElement.ts';

export function getFrameElements(el: Element | undefined) {
  const frames = new Set<Element>();
  let frame = getFrameElement(el);

  while (frame) {
    frames.add(frame);
    frame = getFrameElement(frame);
  }

  return frames;
}
