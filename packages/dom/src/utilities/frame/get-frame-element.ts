export function getFrameElement(el: Element | undefined) {
  const refWindow = el?.ownerDocument.defaultView;

  // Do not reach above the main execution context
  if (refWindow && 'dnd-kit' in refWindow) {
    return null;
  }

  if (refWindow && refWindow.self !== refWindow.parent) {
    return refWindow.frameElement;
  }

  return null;
}
