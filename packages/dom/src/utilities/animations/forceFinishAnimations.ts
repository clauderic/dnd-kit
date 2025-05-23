import {Scheduler} from '../scheduling/scheduler.ts';
import {isKeyframeEffect} from '../type-guards/isKeyframeEffect.ts';

const scheduler = new Scheduler((callback) => setTimeout(callback, 0));
const animations = new Map<Document | Element, Animation[]>();
const clear = animations.clear.bind(animations);

function getDocumentAnimations(element: Element): Animation[] {
  const document = element.ownerDocument;
  let documentAnimations = animations.get(document);

  if (documentAnimations) return documentAnimations;

  documentAnimations = document.getAnimations();
  animations.set(document, documentAnimations);
  scheduler.schedule(clear);

  const elementAnimations = documentAnimations.filter(
    (animation) =>
      isKeyframeEffect(animation.effect) && animation.effect.target === element
  );

  animations.set(element, elementAnimations);

  return documentAnimations;
}

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
  const animations = getDocumentAnimations(element)
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

      if (animation.pending || animation.playState === 'finished') return;

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
