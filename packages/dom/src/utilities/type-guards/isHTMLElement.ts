import {getWindow} from '../execution-context/getWindow.ts';

import {isWindow} from './isWindow.ts';

export function isHTMLElement(node: Node | Window): node is HTMLElement {
  if (isWindow(node)) {
    return false;
  }

  return node instanceof getWindow(node).HTMLElement;
}
