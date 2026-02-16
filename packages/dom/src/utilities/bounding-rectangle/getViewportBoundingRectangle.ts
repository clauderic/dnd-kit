import type {BoundingRectangle} from '@dnd-kit/geometry';

import {getDocument} from '../execution-context/getDocument.ts';
import {getWindow} from '../execution-context/getWindow.ts';

/**
 * Returns the bounding rectangle of the viewport.
 *
 * When the visual viewport is available, uses its dimensions and offset
 * to account for pinch-to-zoom. The returned rectangle is in layout viewport
 * coordinates, consistent with `clientX`/`clientY` and `getBoundingClientRect()`.
 *
 * @param element
 * @returns BoundingRectangle
 */
export function getViewportBoundingRectangle(
  element: Element
): BoundingRectangle {
  const {documentElement} = getDocument(element);
  const vv = getWindow(element).visualViewport;
  const width = vv?.width ?? documentElement.clientWidth;
  const height = vv?.height ?? documentElement.clientHeight;
  const top = vv?.offsetTop ?? 0;
  const left = vv?.offsetLeft ?? 0;

  return {
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}
