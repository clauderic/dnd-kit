import {getOwnerDocument, getWindow} from '@dnd-kit/utilities';

export function getEventListenerTarget(
  target: EventTarget | null
): EventTarget | Document {
  // If the `event.target` element is removed from the document events will still be targeted
  // at it, and hence won't always bubble up to the window or document anymore.
  // If there is any risk of an element being removed while it is being dragged,
  // the best practice is to attach the event listeners directly to the target.
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

  const {EventTarget} = getWindow(target);

  return target instanceof EventTarget ? target : getOwnerDocument(target);
}
