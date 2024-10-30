import {Rectangle, type BoundingRectangle} from '@dnd-kit/geometry';

import {inverseTransform} from '../transform/inverseTransform.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTransform, type Transform} from '../transform/index.ts';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getWindow} from '../execution-context/getWindow.ts';
import {getFrameOffset} from '../frame/get-frame-offset.ts';

interface Options {
  getBoundingClientRect?: (element: Element) => BoundingRectangle;
  /* Whether to ignore transforms when calculating the rectangle */
  ignoreTransforms?: boolean;
}

export class DOMRectangle extends Rectangle {
  constructor(element: Element, options: Options = {}) {
    const {
      ignoreTransforms = false,
      getBoundingClientRect = getBoundingRectangle,
    } = options;
    const resetAnimations = forceFinishAnimations(element);
    const iframeOffset = getFrameOffset(element);
    const rect = getBoundingClientRect(element);

    if (!ignoreTransforms) {
      rect.left *= iframeOffset.scaleX;
      rect.width *= iframeOffset.scaleX;
      rect.right *= iframeOffset.scaleX;
      rect.top *= iframeOffset.scaleY;
      rect.height *= iframeOffset.scaleY;
      rect.bottom *= iframeOffset.scaleY;
    }

    let {top, left, right, bottom, width, height} = Rectangle.from(
      rect
    ).translate(iframeOffset.x, iframeOffset.y);

    const computedStyles = window.getComputedStyle(element);
    const parsedTransform = parseTransform(computedStyles);

    const scale = {
      x: parsedTransform?.scaleX ?? 1,
      y: parsedTransform?.scaleY ?? 1,
    };

    resetAnimations?.();

    const projectedTransform = getProjectedTransform(element);

    if (parsedTransform && (ignoreTransforms || projectedTransform)) {
      const updated = inverseTransform(
        {top, left, right, bottom, width, height},
        parsedTransform,
        computedStyles.transformOrigin
      );

      top = updated.top;
      left = updated.left;
      width = updated.width;
      height = updated.height;
    }

    if (projectedTransform && !ignoreTransforms) {
      top = top + projectedTransform.y;
      left = left + projectedTransform.x;
      width = width * projectedTransform.scaleX;
      height = height * projectedTransform.scaleY;
      scale.x = projectedTransform.scaleX;
      scale.y = projectedTransform.scaleY;
    }

    super(left, top, width, height);

    this.scale = scale;
  }
}

/*
 * Get the projected transform of an element based on its final keyframe
 */
function getProjectedTransform(element: Element): Transform | null {
  const {KeyframeEffect} = getWindow(element);
  const animations = element.getAnimations();
  let projectedTransform: Transform | null = null;

  if (!animations.length) return null;

  for (const animation of animations) {
    const keyframes =
      animation.effect instanceof KeyframeEffect
        ? animation.effect.getKeyframes()
        : [];
    const keyframe = keyframes[keyframes.length - 1];

    if (!keyframe) continue;

    const {transform = '', translate = '', scale = ''} = keyframe;

    if (transform || translate || scale) {
      const parsedTransform = parseTransform({
        transform: typeof transform === 'string' ? transform : '',
        translate: typeof translate === 'string' ? translate : '',
        scale: typeof scale === 'string' ? scale : '',
      });

      if (parsedTransform) {
        projectedTransform = projectedTransform
          ? {
              x: projectedTransform.x + parsedTransform.x,
              y: projectedTransform.y + parsedTransform.y,
              z: projectedTransform.z ?? parsedTransform.z,
              scaleX: projectedTransform.scaleX * parsedTransform.scaleX,
              scaleY: projectedTransform.scaleY * parsedTransform.scaleY,
            }
          : parsedTransform;
      }
    }
  }

  return projectedTransform;
}

/*
 * Force animations on ancestors of the element into their end state
 * and return a function to reset them back to their current state.
 *
 * This is useful as it allows us to immediately calculate the final position
 * of an element without having to wait for the animations to finish.
 */
function forceFinishAnimations(element: Element): (() => void) | undefined {
  const {KeyframeEffect} = getWindow(element);
  const animations = element.ownerDocument
    .getAnimations()
    .filter((animation) => {
      if (animation.effect instanceof KeyframeEffect) {
        const {target} = animation.effect;

        if (target !== element && target?.contains(element)) {
          return animation.effect.getKeyframes().some((keyframe) => {
            const {transform, translate, scale, width, height} = keyframe;

            return transform || translate || scale || width || height;
          });
        }
      }
    })
    .map((animation) => {
      const {effect, currentTime} = animation;
      const duration = effect?.getComputedTiming().duration;

      if (animation.pending) return;

      if (
        typeof duration == 'number' &&
        typeof currentTime == 'number' &&
        currentTime < duration
      ) {
        animation.currentTime = duration;

        return () => {
          animation.currentTime = currentTime;
        };
      }
    });

  if (animations.length > 0) {
    return () => animations.forEach((reset) => reset?.());
  }
}
