export function isKeyframeEffect(
  effect: AnimationEffect | null | undefined
): effect is KeyframeEffect {
  if (!effect) return false;

  if (effect instanceof KeyframeEffect) return true;

  return 'getKeyframes' in effect && typeof effect.getKeyframes === 'function';
}
