export {
  getBoundingRectangle,
  getViewportBoundingRectangle,
} from './bounding-rectangle/index.ts';
export {getVisibleBoundingRectangle} from './bounding-rectangle/getVisibleBoundingRectangle.ts';

export {canUseDOM, getDocument, getWindow} from './execution-context/index.ts';
export {isSafari} from './execution-context/isSafari.ts';

export {
  cloneElement,
  getElementFromPoint,
  ProxiedElements,
} from './element/index.ts';

export {Listeners} from './event-listeners/index.ts';

export {PositionObserver} from './observers/index.ts';
export {ResizeNotifier} from './observers/ResizeNotifier.ts';

export {showPopover, supportsPopover} from './popover/index.ts';

export {
  canScroll,
  detectScrollIntent,
  getScrollableAncestors,
  getFirstScrollableAncestor,
  isDocumentScrollingElement,
  ScrollDirection,
  scrollIntoViewIfNeeded,
} from './scroll/index.ts';

export {scheduler, Scheduler, timeout} from './scheduling/index.ts';

export {DOMRectangle, type DOMRectangleOptions} from './shapes/index.ts';

export {Styles, getComputedStyles} from './styles/index.ts';

export {
  supportsViewTransition,
  supportsStyle,
  isElement,
  isHTMLElement,
  isKeyframeEffect,
  isKeyboardEvent,
  isPointerEvent,
} from './type-guards/index.ts';
export {isTextInput} from './type-guards/isTextInput.ts';

export {
  animateTransform,
  computeTranslate,
  inverseTransform,
  parseTransform,
  parseTranslate,
} from './transform/index.ts';
export type {Transform} from './transform/index.ts';

export {generateUniqueId} from './misc/generateUniqueId.ts';

export {getFrameElement} from './frame/getFrameElement.ts';
export {getFrameTransform} from './frame/getFrameTransform.ts';
