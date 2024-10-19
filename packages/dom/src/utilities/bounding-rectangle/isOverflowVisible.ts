import {getWindow} from '../execution-context/getWindow.ts';

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
  if (
    element instanceof getWindow(element).HTMLDetailsElement &&
    element.open === false
  ) {
    return false;
  }

  const {overflow, overflowX, overflowY} = style ?? getComputedStyle(element);

  return (
    overflow === 'visible' && overflowX === 'visible' && overflowY === 'visible'
  );
}
