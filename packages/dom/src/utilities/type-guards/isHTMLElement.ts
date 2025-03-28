import {getWindow} from '../execution-context/getWindow.ts';

import {isWindow} from './isWindow.ts';

export function isHTMLElement(node: Node | Window | null): node is HTMLElement {
  if (!node || isWindow(node)) return false;

  return (
    node instanceof getWindow(node).HTMLElement ||
    ('namespaceURI' in node &&
      typeof node.namespaceURI === 'string' &&
      node.namespaceURI.endsWith('html'))
  );
}
