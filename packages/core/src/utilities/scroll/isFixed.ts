export function isFixed(node: HTMLElement): boolean {
  return window.getComputedStyle(node).position === 'fixed';
}
