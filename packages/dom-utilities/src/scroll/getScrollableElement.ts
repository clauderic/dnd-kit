import {canUseDOM, getDocument} from '../execution-context';
import {isHTMLElement, isDocument, isNode, isWindow} from '../type-guards';

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
    element === getDocument(element).scrollingElement
  ) {
    return window;
  }

  if (isHTMLElement(element)) {
    return element;
  }

  return null;
}
