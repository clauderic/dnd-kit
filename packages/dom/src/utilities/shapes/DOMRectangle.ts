import {Rectangle} from '@dnd-kit/geometry';

import {inverseTransform} from '../transform/inverseTransform.ts';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTransform, type Transform} from '../transform/index.ts';
import {getFinalKeyframe} from '../keyframes/getFinalKeyframe.ts';

export class DOMRectangle extends Rectangle {
  constructor(element: Element, ignoreTransforms = false) {
    let {top, left, right, bottom, width, height} =
      getBoundingRectangle(element);
    const computedStyles = getComputedStyles(element);
    const parsedTransform = parseTransform(computedStyles);
    const scale = {
      x: parsedTransform?.scaleX ?? 1,
      y: parsedTransform?.scaleY ?? 1,
    };
    const projectedTransform = getProjectedTransform(element);

    if (parsedTransform && (ignoreTransforms || projectedTransform)) {
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

    if (projectedTransform && !ignoreTransforms) {
      top = top + projectedTransform.y;
      left = left + projectedTransform.x;
      width = width * projectedTransform.scaleX;
      height = height * projectedTransform.scaleY;
      scale.x = projectedTransform.scaleX;
      scale.y = projectedTransform.scaleY;
    }

    super(left, top, width, height);

    this.scale = scale;
  }
}

/*
 * Get the projected transform of an element based on its final keyframe
 */
function getProjectedTransform(element: Element): Transform | null {
  const keyframe = getFinalKeyframe(element);

  if (keyframe) {
    const {transform = '', translate = '', scale = ''} = keyframe;

    if (transform || translate || scale) {
      return parseTransform({
        transform: typeof transform === 'string' ? transform : '',
        translate: typeof translate === 'string' ? translate : '',
        scale: typeof scale === 'string' ? scale : '',
      });
    }
  }

  return null;
}
