import {getWindow} from '../execution-context/getWindow.js';

import {isWindow} from './isWindow.js';

export function isHTMLElement(node: Node | Window): node is HTMLElement {
  if (isWindow(node)) {
    return false;
  }

  return node instanceof getWindow(node).HTMLElement;
}
