export function getFinalKeyframe(element: Element): Keyframe | null {
  const animations = element.getAnimations();

  if (animations.length > 0) {
    const [animation] = animations;
    const {effect} = animation;
    const keyframes =
      effect instanceof KeyframeEffect ? effect.getKeyframes() : [];

    if (keyframes.length > 0) {
      return keyframes?.[keyframes.length - 1];
    }
  }

  return null;
}
