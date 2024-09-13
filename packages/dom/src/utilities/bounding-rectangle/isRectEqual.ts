import type {BoundingRectangle} from '@dnd-kit/geometry';

export function isRectEqual(
  a: BoundingRectangle | undefined,
  b: BoundingRectangle | undefined
) {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.top == b.top &&
    a.left == b.left &&
    a.right == b.right &&
    a.bottom == b.bottom
  );
}
