import {canUseDOM} from '@dnd-kit/utilities';

export function getScrollableElement(element: EventTarget | null) {
  if (!canUseDOM) {
    return null;
  }

  if (element === document.scrollingElement || element instanceof Document) {
    return window;
  }

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}
