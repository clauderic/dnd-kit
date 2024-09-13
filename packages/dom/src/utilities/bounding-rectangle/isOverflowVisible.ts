/*
 * Check if an element has visible overflow.
 * @param element
 * @param style
 * @returns boolean
 */
export function isOverflowVisible(
  element: Element,
  style = getComputedStyle(element)
) {
  const {overflow, overflowX, overflowY} = style;

  return (
    overflow === 'visible' && overflowX === 'visible' && overflowY === 'visible'
  );
}
