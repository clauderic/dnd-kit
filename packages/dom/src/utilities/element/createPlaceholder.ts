import {cloneElement} from './cloneElement.js';

export function createPlaceholder(element: Element, clone = false): Element {
  const placeholder = cloneElement(element);

  if (placeholder instanceof HTMLElement) {
    const {margin, maxWidth, maxHeight, minHeight, minWidth} =
      getComputedStyle(element);

    placeholder.style.maxWidth = maxWidth;
    placeholder.style.maxHeight = maxHeight;
    placeholder.style.minHeight = minHeight;
    placeholder.style.minWidth = minWidth;
    placeholder.style.margin = margin;

    if (!clone) {
      placeholder.style.opacity = '0';
    }
  }

  placeholder.setAttribute('tab-index', '-1');
  placeholder.ariaHidden = 'true';

  return placeholder;
}
