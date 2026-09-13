import {supportsPopover} from './supportsPopover.ts';

export function showPopover(element: Element): boolean {
  try {
    if (
      supportsPopover(element) &&
      element.isConnected &&
      element.hasAttribute('popover') &&
      // This selector can throw an error in browsers that don't support it
      !element.matches(':popover-open')
    ) {
      element.showPopover();
      return true;
    }
  } catch (error) {
    // no-op
  }

  return false;
}
