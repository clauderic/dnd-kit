import {getComputedStyles} from '../styles/getComputedStyles.ts';

export function isFixed(
  node: Element,
  computedStyle: CSSStyleDeclaration = getComputedStyles(node)
): boolean {
  return (
    computedStyle.position === 'fixed' || computedStyle.position === 'sticky'
  );
}
