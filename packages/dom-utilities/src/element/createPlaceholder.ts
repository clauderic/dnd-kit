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

  placeholder.setAttribute('tab-index', '-1');
  placeholder.ariaHidden = 'true';

  return placeholder;
}
