import {getComputedStyles} from '../styles/getComputedStyles.ts';

export function isScrollable(
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration = getComputedStyles(element, true)
): boolean {
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.some((property) => {
    const value = computedStyle[property as keyof CSSStyleDeclaration];

    return typeof value === 'string' ? overflowRegex.test(value) : false;
  });
}
