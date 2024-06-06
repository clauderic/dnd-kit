import {supportsPopover} from './supportsPopover.ts';

export function showPopover(element: Element) {
  if (supportsPopover(element) && element.isConnected) {
    element.showPopover();
  }
}
