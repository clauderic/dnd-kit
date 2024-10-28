import {Transform} from './parseTransform.ts';

export function computeRelativeTransform(
  transformA: Transform,
  transformB: Transform
) {
  const scaleX = transformB.scaleX / transformA.scaleX;
  const scaleY = transformB.scaleY / transformA.scaleY;

  return {
    scaleX,
    scaleY,
    x: transformB.x - transformA.x,
    y: transformB.y - transformA.y,
    z: (transformB.z || 1) - (transformA.z || 1),
  };
}
