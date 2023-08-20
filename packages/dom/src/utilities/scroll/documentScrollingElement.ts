import {canUseDOM} from '../execution-context/canUseDOM.js';
import {getDocument} from '../execution-context/getDocument.js';

export function isDocumentScrollingElement(element: Element | null) {
  if (!canUseDOM || !element) {
    return false;
  }

  return element === getDocument(element).scrollingElement;
}
