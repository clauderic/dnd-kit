import {canUseDOM} from '../execution-context/canUseDOM.ts';
import {getDocument} from '../execution-context/getDocument.ts';

export function isDocumentScrollingElement(element: Element | null) {
  if (!canUseDOM || !element) {
    return false;
  }

  return element === getDocument(element).scrollingElement;
}
