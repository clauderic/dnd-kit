import {canUseDOM} from '../execution-context/canUseDOM.ts';
import {getDocument} from '../execution-context/getDocument.ts';
import {isDocument} from '../type-guards/isDocument.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {isNode} from '../type-guards/isNode.ts';
import {isWindow} from '../type-guards/isWindow.ts';

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
