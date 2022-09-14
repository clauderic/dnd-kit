import type {BoundingRectangle} from '@dnd-kit/geometry';

import {getOwnerDocument} from '../execution-context';

export function getViewportBoundingRectangle(
  element: Element
): BoundingRectangle {
  const {documentElement} = getOwnerDocument(element);
  const width = documentElement.clientWidth;
  const height = documentElement.clientHeight;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
}
