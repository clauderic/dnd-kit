import {Rectangle} from '@dnd-kit/geometry';

import {inverseTransform} from '../transform/inverseTransform.ts';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getWindow} from '../execution-context/getWindow.ts';
import {parseTransform, parseTranslate} from '../transform/index.ts';

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
