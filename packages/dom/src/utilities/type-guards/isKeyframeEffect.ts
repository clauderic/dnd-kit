export function isKeyframeEffect(
  effect: AnimationEffect | null | undefined
): effect is KeyframeEffect {
  if (!effect) return false;

  if (effect instanceof KeyframeEffect) return true;

  return (
    typeof effect === 'object' &&
    'getKeyframes' in effect &&
    typeof effect.getKeyframes === 'function' &&
    'composite' in effect &&
    'iterationComposite' in effect
  );
}
