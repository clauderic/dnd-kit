import {getFinalKeyframe} from '../animations/getFinalKeyframe.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';

import {parseTranslate} from './parseTranslate.ts';

export function computeTranslate(
  element: Element,
  translate = getComputedStyles(element).translate,
  projected = true
): {
  x: number;
  y: number;
  z: number;
} {
  if (projected) {
    const keyframe = getFinalKeyframe(
      element,
      (keyframe) => 'translate' in keyframe
    );

    if (keyframe) {
      const {translate = ''} = keyframe[0];

      if (typeof translate === 'string') {
        const finalTranslate = parseTranslate(translate);

        if (finalTranslate) {
          return finalTranslate;
        }
      }
    }
  }

  if (translate) {
    const finalTranslate = parseTranslate(translate);

    if (finalTranslate) {
      return finalTranslate;
    }
  }

  return {x: 0, y: 0, z: 0};
}
