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

  if (isDocument(element)) {
    return element.defaultView ?? window;
  }

  if (element === getOwnerDocument(element).scrollingElement) {
    return getOwnerDocument(element)?.defaultView ?? window;
  }

  if (isHTMLElement(element)) {
    return element;
  }

  return null;
}
