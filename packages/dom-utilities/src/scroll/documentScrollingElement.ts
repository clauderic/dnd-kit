import {canUseDOM, getDocument} from '../execution-context';

export function isDocumentScrollingElement(element: Element | null) {
  if (!canUseDOM || !element) {
    return false;
  }

  return element === getDocument(element).scrollingElement;
}
