import {supportsPopover} from './supportsPopover.ts';

export function hidePopover(element: Element) {
  if (
    supportsPopover(element) &&
    element.isConnected &&
    element.hasAttribute('popover') &&
    element.matches(':popover-open')
  ) {
    element.hidePopover();
  }
}
