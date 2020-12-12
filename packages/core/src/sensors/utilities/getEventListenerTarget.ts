import {getOwnerDocument} from '../../utilities/getOwnerDocument';

export function getEventListenerTarget(
  element: EventTarget | null
): HTMLElement | Document {
  return element instanceof HTMLElement ? element : getOwnerDocument(element);
}
