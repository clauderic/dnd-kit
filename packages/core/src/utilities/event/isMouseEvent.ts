export function isMouseEvent(event: Event): event is MouseEvent {
  return (
    (window?.MouseEvent && event instanceof MouseEvent) ||
    event.type.includes('mouse')
  );
}
