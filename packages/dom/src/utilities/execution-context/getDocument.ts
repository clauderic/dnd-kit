import {isDocument} from '../type-guards/isDocument.js';
import {isHTMLElement} from '../type-guards/isHTMLElement.js';
import {isNode} from '../type-guards/isNode.js';
import {isWindow} from '../type-guards/isWindow.js';

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
