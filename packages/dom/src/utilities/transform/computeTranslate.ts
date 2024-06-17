import {getFinalKeyframe} from '../keyframes/getFinalKeyframe.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTranslate} from './parseTranslate.ts';

export function computeTranslate(element: Element): {
  x: number;
  y: number;
  z: number;
} {
  const keyframe = getFinalKeyframe(element);

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
