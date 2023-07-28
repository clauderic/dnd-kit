import {isDocumentScrollingElement} from './documentScrollingElement';
import {
  getViewportBoundingRectangle,
  getBoundingRectangle,
} from '../bounding-rectangle';

export function getScrollPosition(scrollableElement: Element) {
  const rect = isDocumentScrollingElement(scrollableElement)
    ? getViewportBoundingRectangle(scrollableElement)
    : getBoundingRectangle(scrollableElement);

  const dimensions = isDocumentScrollingElement(scrollableElement)
    ? {
        height: window.innerHeight,
        width: window.innerWidth,
      }
    : {
        height: scrollableElement.clientHeight,
        width: scrollableElement.clientWidth,
      };
  const position = {
    current: {
      x: scrollableElement.scrollLeft,
      y: scrollableElement.scrollTop,
    },
    max: {
      x: scrollableElement.scrollWidth - dimensions.width,
      y: scrollableElement.scrollHeight - dimensions.height,
    },
  };

  const isTop = position.current.y <= 0;
  const isLeft = position.current.x <= 0;
  const isBottom = position.current.y >= position.max.y;
  const isRight = position.current.x >= position.max.x;

  return {
    rect,
    position,
    isTop,
    isLeft,
    isBottom,
    isRight,
  };
}
