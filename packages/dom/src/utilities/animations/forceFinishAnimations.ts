import {isKeyframeEffect} from '../type-guards/isKeyframeEffect.ts';

/*
 * Force animations on ancestors of the element into their end state
 * and return a function to reset them back to their current state.
 *
 * This is useful as it allows us to immediately calculate the final position
 * of an element without having to wait for the animations to finish.
 */
export function forceFinishAnimations(
  element: Element,
  options: {
    properties: string[];
    isValidTarget?: (target: Element) => boolean;
  }
): (() => void) | undefined {
  // Rendering can start an ancestor animation in the same turn as a previous
  // measurement. A cached list would mix its final rectangle with its children's
  // animated rectangles, creating collision candidates that share no layout.
  const animations = element.ownerDocument
    .getAnimations()
    .filter((animation) => {
      if (isKeyframeEffect(animation.effect)) {
        const {target} = animation.effect;
        const isValidTarget =
          (target && options.isValidTarget?.(target)) ?? true;

        if (isValidTarget) {
          return animation.effect.getKeyframes().some((keyframe) => {
            for (const property of options.properties) {
              if (keyframe[property]) return true;
            }
          });
        }
      }
    })
    .map((animation) => {
      const {effect, currentTime} = animation;
      const duration = effect?.getComputedTiming().duration;

      if (animation.playState === 'finished') return;

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
