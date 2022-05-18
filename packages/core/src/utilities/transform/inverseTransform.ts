import type {ClientRect} from '../../types';

import {parseTransform} from './parseTransform';

export function inverseTransform(
  rect: ClientRect,
  transform: string,
  transformOrigin: string
): ClientRect {
  const parsedTransform = parseTransform(transform);

  if (!parsedTransform) {
    return rect;
  }

  const {scaleX, scaleY, x: translateX, y: translateY} = parsedTransform;

  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y =
    rect.top -
    translateY -
    (1 - scaleY) *
      parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;

  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
  };
}
