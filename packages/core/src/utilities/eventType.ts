export function isTouchEvent(event: Event): event is TouchEvent {
  return window?.TouchEvent && event instanceof TouchEvent;
}

export function isMouseEvent(event: Event): event is MouseEvent {
  return (
    (window?.MouseEvent && event instanceof MouseEvent) ||
    event.type.includes('mouse')
  );
}
