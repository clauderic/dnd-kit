import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getViewportBoundingRectangle} from '../bounding-rectangle/getViewportBoundingRectangle.ts';
import {getWindow} from '../execution-context/getWindow.ts';
import {isDocumentScrollingElement} from './documentScrollingElement.ts';

export interface ScrollPosition {
  rect: {width: number; height: number; top: number; left: number; bottom: number; right: number};
  position: {current: {x: number; y: number}; max: {x: number; y: number}};
  isTop: boolean;
  isLeft: boolean;
  isBottom: boolean;
  isRight: boolean;
}

export function getScrollPosition(scrollableElement: Element): ScrollPosition {
  const window = getWindow(scrollableElement);
  const rect = isDocumentScrollingElement(scrollableElement)
    ? getViewportBoundingRectangle(scrollableElement)
    : getBoundingRectangle(scrollableElement);

  const vv = window.visualViewport;
  const dimensions = isDocumentScrollingElement(scrollableElement)
    ? {
        height: vv?.height ?? window.innerHeight,
        width: vv?.width ?? window.innerWidth,
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
