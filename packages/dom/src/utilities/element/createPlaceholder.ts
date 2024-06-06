import {cloneElement} from './cloneElement.ts';
import {supportsStyle} from '../type-guards/supportsStyle.ts';

export function createPlaceholder(
  element: Element,
  clone = false,
  attributes?: Record<string, string>
): Element {
  const placeholder = cloneElement(element);

  if (supportsStyle(placeholder)) {
    if (!clone) {
      placeholder.style.setProperty('opacity', '0');
    }
  }

  placeholder.setAttribute('inert', 'true');
  placeholder.setAttribute('tab-index', '-1');
  placeholder.setAttribute('aria-hidden', 'true');

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      placeholder.setAttribute(key, value);
    }
  }

  return placeholder;
}
