import {getWindow} from '../execution-context/getWindow.ts';

export function isPointerEvent(
  event: Event | null | undefined
): event is PointerEvent {
  if (!event) return false;

  const {PointerEvent} = getWindow(event.target);

  return event instanceof PointerEvent;
}
