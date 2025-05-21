export function getFrameElement(el: Element | undefined) {
  const refWindow = el?.ownerDocument.defaultView;

  if (refWindow && refWindow.self !== refWindow.parent) {
    return refWindow.frameElement;
  }
}
