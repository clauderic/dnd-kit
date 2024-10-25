import {Point} from '@dnd-kit/geometry';
import getIframe from './get-iframe.ts';

export default function getIframeOffset(el: Element) {
  const offset: Point = {
    x: 0,
    y: 0,
  };

  let iframe = getIframe(el);

  while (iframe) {
    const rect = iframe.getBoundingClientRect();

    offset.x = offset.x + rect.left;
    offset.y = offset.y + rect.top;

    iframe = getIframe(iframe);
  }

  return offset;
}
