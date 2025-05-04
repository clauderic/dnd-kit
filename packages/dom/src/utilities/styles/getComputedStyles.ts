import {getWindow} from '../execution-context/getWindow.ts';
import {Scheduler} from '../scheduling/scheduler.ts';

const scheduler = new Scheduler((callback) => setTimeout(callback, 50));
const cachedStyles = new Map<Element, CSSStyleDeclaration>();
const clear = cachedStyles.clear.bind(cachedStyles);

/**
 * Get the computed styles for an element.
 * @param element - The element to get the computed styles for.
 * @param cached - Whether to cache the computed styles.
 * @returns The computed styles for the element.
 */
export function getComputedStyles(
  element: Element,
  cached = false
): CSSStyleDeclaration {
  if (!cached) return computeStyles(element);

  let styles = cachedStyles.get(element);

  if (styles) return styles;

  styles = computeStyles(element);
  cachedStyles.set(element, styles);
  scheduler.schedule(clear);

  return styles;
}

function computeStyles(element: Element): CSSStyleDeclaration {
  return getWindow(element).getComputedStyle(element);
}
