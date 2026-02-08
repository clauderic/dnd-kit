export function prefersReducedMotion(window: Window): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
