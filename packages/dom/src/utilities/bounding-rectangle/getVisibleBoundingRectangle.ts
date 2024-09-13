import type {BoundingRectangle} from '@dnd-kit/geometry';

import {isOverflowVisible} from './isOverflowVisible.ts';

/*
 * Get the currently visible bounding rectangle of an element
 * @param element
 * @param boundingClientRect
 * @returns Rect
 */
export function getVisibleBoundingRectangle(
  element: Element,
  boundingClientRect = element.getBoundingClientRect(),
  margin = 0
): BoundingRectangle {
  // Get the initial bounding client rect of the element
  let rect: BoundingRectangle = boundingClientRect;
  const {ownerDocument} = element;
  const ownerWindow = ownerDocument.defaultView ?? window;

  // Traverse up the DOM tree to clip the rect based on ancestors' bounding rects
  let ancestor: HTMLElement | null = element.parentElement;

  while (ancestor && ancestor !== ownerDocument.documentElement) {
    if (!isOverflowVisible(ancestor)) {
      const ancestorRect = ancestor.getBoundingClientRect();

      const marginTop = margin * (ancestorRect.bottom - ancestorRect.top);
      const marginRight = margin * (ancestorRect.right - ancestorRect.left);
      const marginBottom = margin * (ancestorRect.bottom - ancestorRect.top);
      const marginLeft = margin * (ancestorRect.right - ancestorRect.left);

      // Clip the rect based on the ancestor's bounding rect
      rect = {
        top: Math.max(rect.top, ancestorRect.top - marginTop),
        right: Math.min(rect.right, ancestorRect.right + marginRight),
        bottom: Math.min(rect.bottom, ancestorRect.bottom + marginBottom),
        left: Math.max(rect.left, ancestorRect.left - marginLeft),
        width: 0, // Will be calculated next
        height: 0, // Will be calculated next
      };

      // Calculate the width and height after clipping
      rect.width = rect.right - rect.left;
      rect.height = rect.bottom - rect.top;
    }

    // Move to the next ancestor
    ancestor = ancestor.parentElement;
  }

  // Clip the rect based on the viewport (window)
  const viewportWidth = ownerWindow.innerWidth;
  const viewportHeight = ownerWindow.innerHeight;
  const viewportMarginY = margin * viewportHeight;
  const viewportMarginX = margin * viewportWidth;

  rect = {
    top: Math.max(rect.top, 0 - viewportMarginY),
    right: Math.min(rect.right, viewportWidth + viewportMarginX),
    bottom: Math.min(rect.bottom, viewportHeight + viewportMarginY),
    left: Math.max(rect.left, 0 - viewportMarginX),
    width: 0, // Will be calculated next
    height: 0, // Will be calculated next
  };

  // Calculate the width and height after clipping
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;

  if (rect.width < 0) {
    rect.width = 0;
  }

  if (rect.height < 0) {
    rect.height = 0;
  }

  return rect;
}
