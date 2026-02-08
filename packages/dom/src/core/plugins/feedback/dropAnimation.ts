import {
  animateTransform,
  DOMRectangle,
  getComputedStyles,
  getFinalKeyframe,
  parseTranslate,
  showPopover,
  type Styles,
} from '@dnd-kit/dom/utilities';
import {Rectangle, type Coordinates, type Alignment} from '@dnd-kit/geometry';

import {CSS_PREFIX, DROPPING_ATTRIBUTE} from './constants.ts';
import {isSameFrame} from './utilities.ts';

export interface DropAnimationOptions {
  /** Duration in milliseconds. @default 250 */
  duration?: number;
  /** CSS easing function. @default 'ease' */
  easing?: string;
}

export type DropAnimationFunction = (context: {
  element: Element;
  feedbackElement: Element;
  placeholder: Element | null | undefined;
  translate: Coordinates;
  moved: boolean;
}) => Promise<void> | void;

export type DropAnimation = DropAnimationOptions | DropAnimationFunction;

const DEFAULT_DURATION = 250;
const DEFAULT_EASING = 'ease';

export interface DropAnimationContext {
  element: Element;
  feedbackElement: Element;
  placeholder: Element | null | undefined;
  translate: Coordinates;
  moved: boolean;
  transition: string;
  alignment: Alignment | undefined;
  styles: Styles;
  animation: DropAnimation | undefined;
  getElementMutationObserver: () => MutationObserver | undefined;
  cleanup: () => void;
  restoreFocus: () => void;
}

export function runDropAnimation(ctx: DropAnimationContext): void {
  const {animation} = ctx;

  if (typeof animation === 'function') {
    const result = animation({
      element: ctx.element,
      feedbackElement: ctx.feedbackElement,
      placeholder: ctx.placeholder,
      translate: ctx.translate,
      moved: ctx.moved,
    });

    Promise.resolve(result).then(() => {
      ctx.cleanup();
      requestAnimationFrame(ctx.restoreFocus);
    });

    return;
  }

  const {
    duration = DEFAULT_DURATION,
    easing = DEFAULT_EASING,
  } = animation ?? {};

  showPopover(ctx.feedbackElement);

  const [, runningAnimation] =
    getFinalKeyframe(
      ctx.feedbackElement,
      (keyframe) => 'translate' in keyframe
    ) ?? [];

  runningAnimation?.pause();

  const target = ctx.placeholder ?? ctx.element;
  const options = {
    frameTransform: isSameFrame(ctx.feedbackElement, target)
      ? null
      : undefined,
  };
  const current = new DOMRectangle(ctx.feedbackElement, options);
  const currentTranslate =
    parseTranslate(getComputedStyles(ctx.feedbackElement).translate) ??
    ctx.translate;
  const final = new DOMRectangle(target, options);
  const delta = Rectangle.delta(current, final, ctx.alignment);
  const finalTranslate = {
    x: currentTranslate.x - delta.x,
    y: currentTranslate.y - delta.y,
  };
  const heightKeyframes =
    Math.round(current.intrinsicHeight) !== Math.round(final.intrinsicHeight)
      ? {
          minHeight: [
            `${current.intrinsicHeight}px`,
            `${final.intrinsicHeight}px`,
          ],
          maxHeight: [
            `${current.intrinsicHeight}px`,
            `${final.intrinsicHeight}px`,
          ],
        }
      : {};
  const widthKeyframes =
    Math.round(current.intrinsicWidth) !== Math.round(final.intrinsicWidth)
      ? {
          minWidth: [
            `${current.intrinsicWidth}px`,
            `${final.intrinsicWidth}px`,
          ],
          maxWidth: [
            `${current.intrinsicWidth}px`,
            `${final.intrinsicWidth}px`,
          ],
        }
      : {};

  ctx.styles.set({transition: ctx.transition}, CSS_PREFIX);
  ctx.feedbackElement.setAttribute(DROPPING_ATTRIBUTE, '');
  ctx.getElementMutationObserver()?.takeRecords();

  animateTransform({
    element: ctx.feedbackElement,
    keyframes: {
      ...heightKeyframes,
      ...widthKeyframes,
      translate: [
        `${currentTranslate.x}px ${currentTranslate.y}px 0`,
        `${finalTranslate.x}px ${finalTranslate.y}px 0`,
      ],
    },
    options: {
      duration:
        ctx.moved || ctx.feedbackElement !== ctx.element ? duration : 0,
      easing,
    },
  }).then(() => {
    ctx.feedbackElement.removeAttribute(DROPPING_ATTRIBUTE);
    runningAnimation?.finish();
    ctx.cleanup();
    requestAnimationFrame(ctx.restoreFocus);
  });
}
