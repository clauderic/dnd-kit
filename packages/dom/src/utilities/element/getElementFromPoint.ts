import type {Coordinates} from '@dnd-kit/geometry';
import {getFrameOffset} from '../frame/getFrameOffset.ts';

export function getElementFromPoint(
  document: Document,
  {x, y}: Coordinates
): Element | null {
  const element = document.elementFromPoint(x, y);

  if (element instanceof HTMLIFrameElement) {
    const {contentDocument} = element;

    if (contentDocument) {
      const {left, top} = element.getBoundingClientRect();

      return getElementFromPoint(contentDocument, {
        x: x - left,
        y: y - top,
      });
    }
  }

  return element;
}
