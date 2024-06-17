import type {Coordinates} from '@dnd-kit/geometry';

import {parseScale} from './parseScale.ts';
import {parseTranslate} from './parseTranslate.ts';

export interface Transform extends Coordinates {
  z?: number;
  scaleX: number;
  scaleY: number;
}

export function parseTransform(computedStyles: {
  scale: string;
  transform: string;
  translate: string;
}): Transform | null {
  const {scale, transform, translate} = computedStyles;
  const parsedScale = parseScale(scale);
  const parsedTranslate = parseTranslate(translate);
  const parsedMatrix = parseTransformMatrix(transform);

  if (!parsedMatrix && !parsedScale && !parsedTranslate) {
    return null;
  }

  const normalizedScale = {
    x: parsedScale?.x ?? 1,
    y: parsedScale?.y ?? 1,
  };

  const normalizedTranslate = {
    x: parsedTranslate?.x ?? 0,
    y: parsedTranslate?.y ?? 0,
  };

  const normalizedMatrix = {
    x: parsedMatrix?.x ?? 0,
    y: parsedMatrix?.y ?? 0,
    scaleX: parsedMatrix?.scaleX ?? 1,
    scaleY: parsedMatrix?.scaleY ?? 1,
  };

  return {
    x: normalizedTranslate.x + normalizedMatrix.x,
    y: normalizedTranslate.y + normalizedMatrix.y,
    z: parsedTranslate?.z ?? 0,
    scaleX: normalizedScale.x * normalizedMatrix.scaleX,
    scaleY: normalizedScale.y * normalizedMatrix.scaleY,
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
