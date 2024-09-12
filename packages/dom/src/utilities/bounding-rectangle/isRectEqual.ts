type Rect = Pick<DOMRectReadOnly, 'top' | 'left' | 'right' | 'bottom'>;

export function isRectEqual(a: Rect | undefined, b: Rect | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.top == b.top &&
    a.left == b.left &&
    a.right == b.right &&
    a.bottom == b.bottom
  );
}
