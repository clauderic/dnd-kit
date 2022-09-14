import {canUseDOM, getOwnerDocument} from '../execution-context';

export function isDocumentScrollingElement(element: Element | null) {
  if (!canUseDOM || !element) {
    return false;
  }

  return element === getOwnerDocument(element).scrollingElement;
}
