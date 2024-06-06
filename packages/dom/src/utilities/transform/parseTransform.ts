import type {Coordinates} from '@dnd-kit/geometry';

import {parseScale} from './parseScale.ts';
import {parseTranslate} from './parseTranslate.ts';

export interface Transform extends Coordinates {
  z?: number;
  scaleX: number;
  scaleY: number;
}

export function parseTransform(
  computedStyles: CSSStyleDeclaration
): Transform | null {
  const {scale, transform, translate} = computedStyles;
  const parsedScale = parseScale(scale);
  const parsedTranslate = parseTranslate(translate);

  if (parsedScale && parsedTranslate) {
    return {
      x: parsedTranslate.x,
      y: parsedTranslate.y,
      z: parsedTranslate.z,
      scaleX: parsedScale.x,
      scaleY: parsedScale.y,
    };
  }

  const parsedMatrix = parseTransformMatrix(transform);

  if (!parsedMatrix && !parsedScale && !parsedTranslate) {
    return null;
  }

  return {
    x: parsedTranslate?.x ?? parsedMatrix?.x ?? 0,
    y: parsedTranslate?.y ?? parsedMatrix?.y ?? 0,
    scaleX: parsedScale?.x ?? parsedMatrix?.scaleX ?? 1,
    scaleY: parsedScale?.y ?? parsedMatrix?.scaleY ?? 1,
  };
}

function parseTransformMatrix(transform: string) {
  if (transform.startsWith('matrix3d(')) {
    const transformArray = transform.slice(9, -1).split(/, /);

    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5],
    };
  } else if (transform.startsWith('matrix(')) {
    const transformArray = transform.slice(7, -1).split(/, /);

    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3],
    };
  }

  return null;
}
