import type {Coordinates, ViewRect} from '../../types';

export function createRectAdjustmentFn(modifier: number) {
  return function adjustViewRect(
    viewRect: ViewRect,
    ...adjustments: Coordinates[]
  ): ViewRect {
    return adjustments.reduce<ViewRect>(
      (acc, adjustment) => ({
        ...acc,
        top: acc.top + modifier * adjustment.y,
        bottom: acc.bottom + modifier * adjustment.y,
        left: acc.left + modifier * adjustment.x,
        right: acc.right + modifier * adjustment.x,
        offsetLeft: acc.offsetLeft + modifier * adjustment.x,
        offsetTop: acc.offsetTop + modifier * adjustment.y,
      }),
      {...viewRect}
    );
  };
}

export const getAdjustedRect = createRectAdjustmentFn(1);
