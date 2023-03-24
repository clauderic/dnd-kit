import {getWindow} from '@dnd-kit/utilities';

export function hasOverflowStyles(
  element: Element,
  computedStyle: CSSStyleDeclaration = getWindow(element).getComputedStyle(
    element
  ),
  overflowRegex: RegExp
): boolean {
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.some((property) => {
    const value = computedStyle[property as keyof CSSStyleDeclaration];

    return typeof value === 'string' ? overflowRegex.test(value) : false;
  });
}
