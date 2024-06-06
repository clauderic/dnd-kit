import {isDocument} from '../type-guards/isDocument.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {isNode} from '../type-guards/isNode.ts';
import {isWindow} from '../type-guards/isWindow.ts';

export function getDocument(target: Event['target']): Document {
  if (!target) {
    return document;
  }

  if (isWindow(target)) {
    return target.document;
  }

  if (!isNode(target)) {
    return document;
  }

  if (isDocument(target)) {
    return target;
  }

  if (isHTMLElement(target)) {
    return target.ownerDocument;
  }

  return document;
}
