import type {BoundingRectangle} from '@dnd-kit/geometry';

import {type Transform} from './parseTransform.ts';

export function applyTransform(
  rect: BoundingRectangle,
  parsedTransform: Transform,
  transformOrigin: string
): BoundingRectangle {
  const {scaleX, scaleY, x: translateX, y: translateY} = parsedTransform;
  const x = rect.left + translateX + (1 - scaleX) * parseFloat(transformOrigin);
  const y =
    rect.top +
    translateY +
    (1 - scaleY) *
      parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
  const w = scaleX ? rect.width * scaleX : rect.width;
  const h = scaleY ? rect.height * scaleY : rect.height;

  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
  };
}
