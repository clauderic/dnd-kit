import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTranslate} from './parseTranslate.ts';

function getFinalKeyframe(
  element: Element,
  match: (keyframe: Keyframe) => boolean
): Keyframe | null {
  const animations = element.getAnimations();

  if (animations.length > 0) {
    for (const animation of animations) {
      const {effect} = animation;
      const keyframes =
        effect instanceof KeyframeEffect ? effect.getKeyframes() : [];
      const matchedKeyframes = keyframes.filter(match);

      if (matchedKeyframes.length > 0) {
        return matchedKeyframes[matchedKeyframes.length - 1];
      }
    }
  }

  return null;
}

export function computeTranslate(element: Element): {
  x: number;
  y: number;
  z: number;
} {
  const keyframe = getFinalKeyframe(
    element,
    (keyframe) => 'translate' in keyframe
  );

  if (keyframe) {
    const {translate = ''} = keyframe;

    if (typeof translate === 'string') {
      const finalTranslate = parseTranslate(translate);

      if (finalTranslate) {
        return finalTranslate;
      }
    }
  }

  const {translate} = getComputedStyles(element);

  if (translate) {
    const finalTranslate = parseTranslate(translate);

    if (finalTranslate) {
      return finalTranslate;
    }
  }

  return {x: 0, y: 0, z: 0};
}
