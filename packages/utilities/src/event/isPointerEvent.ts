export function isPointerEvent(event: Event): event is PointerEvent {
  return (
    (window?.PointerEvent && event instanceof PointerEvent) ||
    event.type.includes('pointer')
  );
}
