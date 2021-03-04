import {getOwnerDocument} from './getOwnerDocument';

export function getWindow(target: Event['target']) {
  return getOwnerDocument(target).defaultView ?? window;
}
