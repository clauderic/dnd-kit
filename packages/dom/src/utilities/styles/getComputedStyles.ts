import {getWindow} from '../execution-context/getWindow.ts';

export function getComputedStyles(element: Element) {
  return getWindow(element).getComputedStyle(element);
}
