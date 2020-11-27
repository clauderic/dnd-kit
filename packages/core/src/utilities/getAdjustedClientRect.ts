import {Coordinates, PositionalClientRect} from '../types';

export function getAdjustedClientRect(
  clientRect: PositionalClientRect,
  ...adjustments: Coordinates[]
): PositionalClientRect {
  return adjustments.reduce<PositionalClientRect>(
    (clientRect, adjustment) => ({
      ...clientRect,
      top: clientRect.top + adjustment.y,
      bottom: clientRect.bottom + adjustment.y,
      left: clientRect.left + adjustment.x,
      right: clientRect.right + adjustment.x,
      offsetLeft: clientRect.offsetLeft + adjustment.x,
      offsetTop: clientRect.offsetTop + adjustment.y,
    }),
    {
      height: clientRect.height,
      width: clientRect.width,
      top: clientRect.top,
      bottom: clientRect.bottom,
      left: clientRect.left,
      right: clientRect.right,
      offsetLeft: clientRect.offsetLeft,
      offsetTop: clientRect.offsetTop,
    }
  );
}
