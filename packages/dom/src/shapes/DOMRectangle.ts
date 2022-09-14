import {Rectangle} from '@dnd-kit/geometry';
import {getBoundingRectangle} from '@dnd-kit/dom-utilities';

export class DOMRectangle extends Rectangle {
  constructor(element: Element) {
    const {top, left, width, height} = getBoundingRectangle(element);

    super(left, top, width, height);

    if (element instanceof HTMLElement) {
      const {offsetWidth, offsetHeight} = element;

      this.scale = {
        x: Math.round(width) / offsetWidth,
        y: Math.round(height) / offsetHeight,
      };
    }
  }
}
