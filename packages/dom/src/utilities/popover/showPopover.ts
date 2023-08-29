import {supportsPopover} from './supportsPopover.js';

export function showPopover(element: Element) {
  if (supportsPopover(element) && element.isConnected) {
    element.showPopover();
  }
}
