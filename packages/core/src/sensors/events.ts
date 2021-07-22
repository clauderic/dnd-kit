export enum EventName {
  Click = 'click',
  Keydown = 'keydown',
  ContextMenu = 'contextmenu',
  Resize = 'resize',
  VisibilityChange = 'visibilitychange',
}

export function preventDefault(event: Event) {
  event.preventDefault();
}

export function stopPropagation(event: Event) {
  event.stopPropagation();
}
