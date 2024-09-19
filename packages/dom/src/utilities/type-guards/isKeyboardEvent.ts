import {getWindow} from '../execution-context/getWindow.ts';

export function isKeyboardEvent(
  event: Event | null | undefined
): event is KeyboardEvent {
  if (!event) return false;

  const {KeyboardEvent} = getWindow(event.target);

  return event instanceof KeyboardEvent;
}
