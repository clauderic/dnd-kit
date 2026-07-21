import type {Axis} from '@dnd-kit/geometry';

import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {parseTransform} from '../transform/parseTransform.ts';

export function getAxisInversionState(element: Element): Record<Axis, boolean> {
  const parsedTransform = parseTransform(getComputedStyles(element, true));

  return {
    x: parsedTransform !== null ? parsedTransform.scaleX < 0 : false,
    y: parsedTransform !== null ? parsedTransform.scaleY < 0 : false,
  };
}
