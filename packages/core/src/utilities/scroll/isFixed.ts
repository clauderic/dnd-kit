export function isFixed(
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration = window.getComputedStyle(node)
): boolean {
  return computedStyle.position === 'fixed';
}
