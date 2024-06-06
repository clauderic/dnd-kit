import {getWindow} from '../execution-context/getWindow.ts';

export function isFixed(
  node: Element,
  computedStyle: CSSStyleDeclaration = getWindow(node).getComputedStyle(node)
): boolean {
  return (
    computedStyle.position === 'fixed' || computedStyle.position === 'sticky'
  );
}
