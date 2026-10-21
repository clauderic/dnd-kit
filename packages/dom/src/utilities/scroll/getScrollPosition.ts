import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getViewportBoundingRectangle} from '../bounding-rectangle/getViewportBoundingRectangle.ts';
import {getWindow} from '../execution-context/getWindow.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isDocumentScrollingElement} from './documentScrollingElement.ts';

export interface ScrollPosition {
  rect: {width: number; height: number; top: number; left: number; bottom: number; right: number};
  position: {
    current: {x: number; y: number};
    min: {x: number; y: number};
    max: {x: number; y: number};
  };
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
  const rangeX = scrollableElement.scrollWidth - dimensions.width;
  // In RTL, scrollLeft runs from -rangeX (fully left) to 0 (start, fully right)
  const isRtl =
    getComputedStyles(scrollableElement, true).direction === 'rtl';
  const position = {
    current: {
      x: scrollableElement.scrollLeft,
      y: scrollableElement.scrollTop,
    },
    min: {
      x: isRtl ? -rangeX : 0,
      y: 0,
    },
    max: {
      x: isRtl ? 0 : rangeX,
      y: scrollableElement.scrollHeight - dimensions.height,
    },
  };

  const isTop = position.current.y <= position.min.y;
  const isLeft = position.current.x <= position.min.x;
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
