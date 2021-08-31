export function hasViewportRelativeCoordinates(
  event: Event
): event is Event & Pick<PointerEvent, 'clientX' | 'clientY'> {
  return 'clientX' in event && 'clientY' in event;
}
