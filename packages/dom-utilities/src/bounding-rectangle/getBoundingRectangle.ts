import {BoundingRectangle} from '@dnd-kit/geometry';

export function getBoundingRectangle(element: Element): BoundingRectangle {
  const {width, height, top, left, bottom, right} =
    element.getBoundingClientRect();

  return {width, height, top, left, bottom, right};
}
