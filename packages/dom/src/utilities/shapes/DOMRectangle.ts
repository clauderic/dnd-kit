import {Rectangle} from '@dnd-kit/geometry';

import {inverseTransform} from '../transform/inverseTransform.js';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.js';
import {getWindow} from '../execution-context/getWindow.js';
import {parseTransform, parseTranslate} from '../transform/index.js';

export class DOMRectangle extends Rectangle {
  constructor(element: Element, ignoreTransforms = false) {
    let {top, left, right, bottom, width, height} =
      getBoundingRectangle(element);
    const computedStyles = getWindow(element).getComputedStyle(element);
    const parsedTransform = parseTransform(computedStyles);
    const scale = {
      x: parsedTransform?.scaleX ?? 1,
      y: parsedTransform?.scaleY ?? 1,
    };

    if (parsedTransform && ignoreTransforms) {
      const updated = inverseTransform(
        {top, left, right, bottom, width, height},
        parsedTransform,
        computedStyles.transformOrigin
      );

      top = updated.top;
      left = updated.left;
      width = updated.width;
      height = updated.height;
    }

    super(left, top, width, height);

    this.scale = scale;
  }
}
