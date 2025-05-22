import {supportsPopover} from './supportsPopover.ts';

export function showPopover(element: Element) {
  try {
    if (
      supportsPopover(element) &&
      element.isConnected &&
      element.hasAttribute('popover') &&
      // This selector can throw an error in browsers that don't support it
      !element.matches(':popover-open')
    ) {
      element.showPopover();
    }
  } catch (error) {
    // no-op
  }
}
