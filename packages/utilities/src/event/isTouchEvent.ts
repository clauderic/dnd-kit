export function isTouchEvent(event: Event): event is TouchEvent {
  return window?.TouchEvent && event instanceof TouchEvent;
}
