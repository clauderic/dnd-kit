import {getVisibleBoundingRectangle} from './getVisibleBoundingRectangle.ts';

export function isVisible(
  element: Element,
  boundingClientRect = element.getBoundingClientRect()
): boolean {
  const {width, height} = getVisibleBoundingRectangle(
    element,
    boundingClientRect
  );

  return width > 0 && height > 0;
}
