import {cloneElement} from './cloneElement.js';
import {supportsStyle} from '../type-guards/supportsStyle.js';

export function createPlaceholder(element: Element, clone = false): Element {
  const placeholder = cloneElement(element);

  if (supportsStyle(placeholder)) {
    if (!clone) {
      placeholder.style.setProperty('opacity', '0');
    }
  }

  placeholder.setAttribute('inert', 'true');
  placeholder.setAttribute('tab-index', '-1');
  placeholder.setAttribute('aria-hidden', 'true');

  return placeholder;
}
