import {getWindow} from '../execution-context/getWindow';

import {isWindow} from './isWindow';

export function isHTMLElement(node: Node | Window): node is HTMLElement {
  if (isWindow(node)) {
    return false;
  }

  return node instanceof getWindow(node).HTMLElement;
}
