import {Rectangle, type BoundingRectangle} from '@dnd-kit/geometry';

import {applyTransform} from '../transform/applyTransform.ts';
import {inverseTransform} from '../transform/inverseTransform.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTransform, type Transform} from '../transform/index.ts';
import {getBoundingRectangle} from '../bounding-rectangle/getBoundingRectangle.ts';
import {getFrameTransform} from '../frame/getFrameTransform.ts';
import {isKeyframeEffect} from '../type-guards/isKeyframeEffect.ts';
import {forceFinishAnimations} from '../animations/forceFinishAnimations.ts';
import {isSafari} from '../execution-context/isSafari.ts';

export interface DOMRectangleOptions {
  getBoundingClientRect?: (element: Element) => BoundingRectangle;
  /* Whether to ignore transforms when calculating the rectangle */
  ignoreTransforms?: boolean;
  frameTransform?: Transform | null;
}

export class DOMRectangle extends Rectangle {
  constructor(element: Element, options: DOMRectangleOptions = {}) {
    const {
      frameTransform = getFrameTransform(element),
      ignoreTransforms,
      getBoundingClientRect = getBoundingRectangle,
    } = options;
    const resetAnimations = forceFinishAnimations(element, {
      properties: ['transform', 'translate', 'scale', 'width', 'height'],
      isValidTarget: (target) =>
        (target !== element || isSafari()) && target.contains(element),
    });
    const boundingRectangle = getBoundingClientRect(element);
    let {top, left, width, height} = boundingRectangle;
    let updated: BoundingRectangle | undefined;

    const computedStyles = getComputedStyles(element);
    const parsedTransform = parseTransform(computedStyles);

    const scale = {
      x: parsedTransform?.scaleX ?? 1,
      y: parsedTransform?.scaleY ?? 1,
    };

    const projectedTransform = getProjectedTransform(element, computedStyles);

    resetAnimations?.();

    if (parsedTransform) {
      updated = inverseTransform(
        boundingRectangle,
        parsedTransform,
        computedStyles.transformOrigin
      );

      if (ignoreTransforms || projectedTransform) {
        top = updated.top;
        left = updated.left;
        width = updated.width;
        height = updated.height;
      }
    }

    const intrinsic = {
      width: updated?.width ?? width,
      height: updated?.height ?? height,
    };

    if (projectedTransform && !ignoreTransforms && updated) {
      const projected = applyTransform(
        updated,
        projectedTransform,
        computedStyles.transformOrigin
      );

      top = projected.top;
      left = projected.left;
      width = projected.width;
      height = projected.height;
      scale.x = projectedTransform.scaleX;
      scale.y = projectedTransform.scaleY;
    }

    if (frameTransform) {
      if (!ignoreTransforms) {
        left *= frameTransform.scaleX;
        width *= frameTransform.scaleX;
        top *= frameTransform.scaleY;
        height *= frameTransform.scaleY;
      }

      left += frameTransform.x;
      top += frameTransform.y;
    }

    super(left, top, width, height);

    this.scale = scale;
    this.intrinsicWidth = intrinsic.width;
    this.intrinsicHeight = intrinsic.height;
  }

  public intrinsicWidth: number;
  public intrinsicHeight: number;
}

/*
 * Get the projected transform of an element based on the final keyframes
 * of its running animations.
 *
 * Uses last-wins-per-property semantics: for each CSS property (transform,
 * translate, scale), the value from the highest composite-order animation
 * wins. `element.getAnimations()` returns animations sorted by composite
 * order (oldest first), so iterating forward and overwriting gives us
 * the effective final value for each property. This correctly handles
 * overlapping animations with `composite: 'replace'` (the default).
 */
function getProjectedTransform(
  element: Element,
  computedStyles: CSSStyleDeclaration
): Transform | null {
  const animations = element.getAnimations();

  if (!animations.length) return null;

  let latestTransform: string | undefined;
  let latestTranslate: string | undefined;
  let latestScale: string | undefined;
  let hasAnimatedProperty = false;

  for (const animation of animations) {
    if (animation.playState !== 'running') continue;

    const keyframes = isKeyframeEffect(animation.effect)
      ? animation.effect.getKeyframes()
      : [];
    const keyframe = keyframes[keyframes.length - 1];

    if (!keyframe) continue;

    const {transform, translate, scale} = keyframe;

    if (typeof transform === 'string' && transform) {
      latestTransform = transform;
      hasAnimatedProperty = true;
    }

    if (typeof translate === 'string' && translate) {
      latestTranslate = translate;
      hasAnimatedProperty = true;
    }

    if (typeof scale === 'string' && scale) {
      latestScale = scale;
      hasAnimatedProperty = true;
    }
  }

  if (!hasAnimatedProperty) return null;

  return parseTransform({
    transform: latestTransform ?? computedStyles.transform,
    translate: latestTranslate ?? computedStyles.translate,
    scale: latestScale ?? computedStyles.scale,
  });
}
