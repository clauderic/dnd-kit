import {DOMRectangle} from '../shapes';
import {cloneElement} from './cloneElement';

export function createPlaceholder(
  element: Element,
  shape = new DOMRectangle(element),
  clone = false
): Element {
  const tagName = element.tagName.toLowerCase();
  const placeholder = clone
    ? cloneElement(element)
    : document.createElement(tagName);

  if (!clone && placeholder instanceof HTMLElement) {
    placeholder.style.width = `${shape.width * shape.inverseScale.x}px`;
    placeholder.style.height = `${shape.height * shape.inverseScale.y}px`;
    placeholder.style.opacity = '0';
  }

  if (placeholder instanceof HTMLElement) {
    const {margin, maxWidth, maxHeight, minHeight, minWidth} =
      getComputedStyle(element);

    placeholder.style.maxWidth = maxWidth;
    placeholder.style.maxHeight = maxHeight;
    placeholder.style.minHeight = minHeight;
    placeholder.style.minWidth = minWidth;
    placeholder.style.margin = margin;
  }

  placeholder.setAttribute('tab-index', '-1');
  placeholder.ariaHidden = 'true';

  return placeholder;
}
