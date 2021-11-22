import type {ClientRect} from '../../types';

export function inverseTransform(
  rect: ClientRect,
  transform: string,
  transformOrigin: string
): ClientRect {
  let ta, sx, sy, dx, dy;

  if (transform.startsWith('matrix3d(')) {
    ta = transform.slice(9, -1).split(/, /);
    sx = +ta[0];
    sy = +ta[5];
    dx = +ta[12];
    dy = +ta[13];
  } else if (transform.startsWith('matrix(')) {
    ta = transform.slice(7, -1).split(/, /);
    sx = +ta[0];
    sy = +ta[3];
    dx = +ta[4];
    dy = +ta[5];
  } else {
    return rect;
  }

  const x = rect.left - dx - (1 - sx) * parseFloat(transformOrigin);
  const y =
    rect.top -
    dy -
    (1 - sy) *
      parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
  const w = sx ? rect.width / sx : rect.width;
  const h = sy ? rect.height / sy : rect.height;

  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
  };
}
