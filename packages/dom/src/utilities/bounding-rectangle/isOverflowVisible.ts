/*
 * Check if an element has visible overflow.
 * @param element
 * @param style
 * @returns boolean
 */
export function isOverflowVisible(
  element: Element,
  style?: CSSStyleDeclaration
) {
  if (isDetailsElement(element) && element.open === false) {
    return false;
  }

  const {overflow, overflowX, overflowY} = style ?? getComputedStyle(element);

  return (
    overflow === 'visible' && overflowX === 'visible' && overflowY === 'visible'
  );
}

function isDetailsElement(element: Element): element is HTMLDetailsElement {
  return element.tagName === 'DETAILS';
}
