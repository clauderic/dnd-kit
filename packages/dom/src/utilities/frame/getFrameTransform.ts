import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import type {Transform} from '../transform/index.ts';

import {getFrameElement} from './getFrameElement.ts';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';

export function getFrameTransform(
  el: Element | undefined,
  boundary: Element | null = window.frameElement
): Transform {
  const transform: Transform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  };

  if (!el) return transform;

  let frame = getFrameElement(el);

  while (frame) {
    if (frame === boundary) {
      return transform;
    }

    const rect = getBoundingRectangle(frame);
    const {x: scaleX, y: scaleY} = getScale(frame, rect);

    transform.x = transform.x + rect.left;
    transform.y = transform.y + rect.top;
    transform.scaleX = transform.scaleX * scaleX;
    transform.scaleY = transform.scaleY * scaleY;

    frame = getFrameElement(frame);
  }

  return transform;
}

function getScale(
  element: Element,
  boundingRectangle = getBoundingRectangle(element)
) {
  const width = Math.round(boundingRectangle.width);
  const height = Math.round(boundingRectangle.height);

  if (isHTMLElement(element)) {
    return {
      x: width / element.offsetWidth,
      y: height / element.offsetHeight,
    };
  }

  const styles = getComputedStyles(element, true);

  return {
    x: (parseFloat(styles.width) || width) / width,
    y: (parseFloat(styles.height) || height) / height,
  };
}
