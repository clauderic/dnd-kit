import type {ClientRect} from '../../types/rect';
import {
  getScrollableAncestors,
  getScrollOffsets,
  getScrollXOffset,
  getScrollYOffset,
} from '../scroll';

const properties = [
  ['x', ['left', 'right'], getScrollXOffset],
  ['y', ['top', 'bottom'], getScrollYOffset],
] as const;

export class Rect {
  constructor(rect: ClientRect, element: Element) {
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);

    this.rect = {...rect};
    this.width = rect.width;
    this.height = rect.height;

    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key of keys) {
        Object.defineProperty(this, key, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;

            return this.rect[key] + scrollOffsetsDeltla;
          },
          enumerable: true,
        });
      }
    }

    Object.defineProperty(this, 'rect', {enumerable: false});
  }

  private rect: ClientRect;

  public width: number;

  public height: number;

  // The below properties are set by the `Object.defineProperty` calls in the constructor
  // @ts-ignore
  public top: number;
  // @ts-ignore
  public bottom: number;
  // @ts-ignore
  public right: number;
  // @ts-ignore
  public left: number;
}
