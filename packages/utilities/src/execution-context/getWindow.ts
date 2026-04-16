import {isWindow} from '../type-guards/isWindow';
import {isNode} from '../type-guards/isNode';

export function getWindow(target: Event['target']): typeof window {
  if (!target) {
    return window;
  }

  if (isWindow(target)) {
    return target;
  }

  if (!isNode(target)) {
    return window;
  }

  let ownerDoc = target.ownerDocument;
  if (!ownerDoc) {
    ownerDoc = 'documentElement' in target ? target : null;
  }
  return ownerDoc?.defaultView ?? window;
}
