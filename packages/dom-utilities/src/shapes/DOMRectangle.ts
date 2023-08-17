import {Rectangle} from '@dnd-kit/geometry';

import {inverseTransform} from '../transform';
import {getBoundingRectangle} from '../bounding-rectangle';
import {getWindow} from '../execution-context';

export class DOMRectangle extends Rectangle {
  constructor(element: Element, ignoreTransforms = false) {
    let {top, left, right, bottom, width, height} =
      getBoundingRectangle(element);

    if (ignoreTransforms) {
      const {transform, transformOrigin} =
        getWindow(element).getComputedStyle(element);

      if (transform) {
        const updated = inverseTransform(
          {top, left, right, bottom, width, height},
          transform,
          transformOrigin
        );

        top = updated.top;
        left = updated.left;
        width = updated.width;
        height = updated.height;
      }
    }

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
