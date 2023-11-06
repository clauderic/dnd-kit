export enum EventName {
  Click = 'click',
  DragStart = 'dragstart',
  Keydown = 'keydown',
  ContextMenu = 'contextmenu',
  Resize = 'resize',
  SelectionChange = 'selectionchange',
  VisibilityChange = 'visibilitychange',
  TouchCancel = 'touchcancel',
}

export function preventDefault(event: Event) {
  event.preventDefault();
}

export function stopPropagation(event: Event) {
  event.stopPropagation();
}
