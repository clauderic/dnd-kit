import {isKeyframeEffect} from '../type-guards/isKeyframeEffect.ts';

export function getFinalKeyframe(
  element: Element,
  match: (keyframe: Keyframe) => boolean
): [Keyframe, Animation] | null {
  const animations = element.getAnimations();

  if (animations.length > 0) {
    for (const animation of animations) {
      if (animation.playState !== 'running') continue;
      const {effect} = animation;
      const keyframes = isKeyframeEffect(effect) ? effect.getKeyframes() : [];
      const matchedKeyframes = keyframes.filter(match);

      if (matchedKeyframes.length > 0) {
        return [matchedKeyframes[matchedKeyframes.length - 1], animation];
      }
    }
  }

  return null;
}
