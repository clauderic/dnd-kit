import {Rectangle} from '@dnd-kit/geometry';

import {getScrollPosition, type ScrollPosition} from './getScrollPosition.ts';
import {getFrameTransform} from '../frame/getFrameTransform.ts';

export function getFrameTransformedScrollPosition(
  element: Element
): ScrollPosition {
  const scrollPosition = getScrollPosition(element);
  const frameTransform = getFrameTransform(element);
  const {rect} = scrollPosition;

  return {
    ...scrollPosition,
    rect: new Rectangle(
      rect.left * frameTransform.scaleX + frameTransform.x,
      rect.top * frameTransform.scaleY + frameTransform.y,
      rect.width * frameTransform.scaleX,
      rect.height * frameTransform.scaleY
    ),
  };
}
