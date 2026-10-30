import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getViewportBoundingRectangle} from '../bounding-rectangle/getViewportBoundingRectangle.ts';
import {getWindow} from '../execution-context/getWindow.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isDocumentScrollingElement} from './documentScrollingElement.ts';

export interface ScrollPosition {
  rect: {
    width: number;
    height: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
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
  const isDocument = isDocumentScrollingElement(scrollableElement);
  const rect = isDocument
    ? getViewportBoundingRectangle(scrollableElement)
    : getBoundingRectangle(scrollableElement);

  const vv = window.visualViewport;
  const dimensions = isDocument
    ? {
        height: vv?.height ?? window.innerHeight,
        width: vv?.width ?? window.innerWidth,
      }
    : {
        height: scrollableElement.clientHeight,
        width: scrollableElement.clientWidth,
      };
  const rangeX = scrollableElement.scrollWidth - dimensions.width;
  const styles = getComputedStyles(scrollableElement, true);
  // Element flow adjustments do not apply to the viewport's formatting context.
  const hasNegativeScrollLeft = isDocument
    ? styles.direction === 'rtl'
    : isHorizontalScrollReversed(styles);
  const position = {
    current: {
      x: scrollableElement.scrollLeft,
      y: scrollableElement.scrollTop,
    },
    min: {
      x: hasNegativeScrollLeft ? -rangeX : 0,
      y: 0,
    },
    max: {
      x: hasNegativeScrollLeft ? 0 : rangeX,
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

function isHorizontalScrollReversed(styles: CSSStyleDeclaration): boolean {
  const {direction, display, writingMode} = styles;
  const isVertical =
    writingMode === 'vertical-lr' ||
    writingMode === 'vertical-rl' ||
    writingMode === 'sideways-lr' ||
    writingMode === 'sideways-rl';
  const isReversed = isVertical
    ? writingMode === 'vertical-rl' || writingMode === 'sideways-rl'
    : direction === 'rtl';

  if (display !== 'flex' && display !== 'inline-flex') {
    return isReversed;
  }

  const {flexDirection, flexWrap} = styles;
  const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
  const isHorizontalMainAxis = isVertical ? !isRow : isRow;
  // Flex reversal changes the scroll origin on the main or cross axis.
  const isFlexReversed = isHorizontalMainAxis
    ? flexDirection === 'row-reverse' || flexDirection === 'column-reverse'
    : flexWrap === 'wrap-reverse';

  return isReversed !== isFlexReversed;
}
