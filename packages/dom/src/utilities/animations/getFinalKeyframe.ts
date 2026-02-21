import {isKeyframeEffect} from '../type-guards/isKeyframeEffect.ts';

export function getFinalKeyframe(
  element: Element,
  match: (keyframe: Keyframe) => boolean
): [Keyframe, Animation] | null {
  const animations = element.getAnimations();
  let result: [Keyframe, Animation] | null = null;

  for (const animation of animations) {
    if (animation.playState !== 'running') continue;
    const {effect} = animation;
    const keyframes = isKeyframeEffect(effect) ? effect.getKeyframes() : [];
    const matchedKeyframes = keyframes.filter(match);

    if (matchedKeyframes.length > 0) {
      result = [matchedKeyframes[matchedKeyframes.length - 1], animation];
    }
  }

  return result;
}
