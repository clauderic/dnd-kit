export enum EventName {
  Blur = 'blur',
  Click = 'click',
  DragStart = 'dragstart',
  Keydown = 'keydown',
  ContextMenu = 'contextmenu',
  Resize = 'resize',
  SelectionChange = 'selectionchange',
  VisibilityChange = 'visibilitychange',
}

export function preventDefault(event: Event) {
  event.preventDefault();
}

export function stopPropagation(event: Event) {
  event.stopPropagation();
}
