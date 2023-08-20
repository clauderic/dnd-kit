import {canUseDOM} from '../execution-context/canUseDOM.js';
import {getDocument} from '../execution-context/getDocument.js';
import {isDocument} from '../type-guards/isDocument.js';
import {isHTMLElement} from '../type-guards/isHTMLElement.js';
import {isNode} from '../type-guards/isNode.js';
import {isWindow} from '../type-guards/isWindow.js';

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
