export function isKeyboardEvent(
  event: Event | null | undefined
): event is KeyboardEvent {
  return event instanceof KeyboardEvent;
}
