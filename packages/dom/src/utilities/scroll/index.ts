export {canScroll} from './canScroll.ts';
export {
  getFirstScrollableAncestor,
  getScrollableAncestors,
} from './getScrollableAncestors.ts';
export {getScrollableElement} from './getScrollableElement.ts';
export {
  detectScrollIntent,
  ScrollDirection,
  detectActivation,
  suppressOpposingIntent,
  applyAcceleration,
  applyAxisInversion,
  stopAtBoundaries,
} from './detectScrollIntent.ts';
export {getFrameTransformedScrollPosition} from './getFrameTransformedScrollPosition.ts';
export {getAxisInversionState} from './getAxisInversionState.ts';
export type {
  ScrollActivation,
  ScrollIntent,
  ScrollIntentDetector,
  ScrollIntentDetectorContext,
  ScrollIntentDetectorOptions,
} from './detectScrollIntent.ts';
export {getScrollPosition} from './getScrollPosition.ts';
export type {ScrollPosition} from './getScrollPosition.ts';
export {isDocumentScrollingElement} from './documentScrollingElement.ts';
export {isScrollable} from './isScrollable.ts';
export {isFixed} from './isFixed.ts';
export {scrollIntoViewIfNeeded} from './scrollIntoViewIfNeeded.ts';
