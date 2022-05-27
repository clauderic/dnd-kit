import {getWindow} from '@dnd-kit/utilities';

export function isScrollable(
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration = getWindow(element).getComputedStyle(
    element
  )
): boolean {
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.some((property) => {
    const value = computedStyle[property as keyof CSSStyleDeclaration];

    return typeof value === 'string' ? overflowRegex.test(value) : false;
  });
}
