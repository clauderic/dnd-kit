import {
  canUseDOM,
  isHTMLElement,
  isDocument,
  getOwnerDocument,
  isNode,
  isWindow,
} from '@dnd-kit/utilities';

export function getScrollableElement(element: EventTarget | null) {
  if (!canUseDOM || !element) {
    return null;
  }

  if (isWindow(element)) {
    return element;
  }

  if (!isNode(element)) {
    return null;
  }

  if (
    isDocument(element) ||
    element === getOwnerDocument(element).scrollingElement
  ) {
    return window;
  }

  if (isHTMLElement(element)) {
    return element;
  }

  return null;
}
