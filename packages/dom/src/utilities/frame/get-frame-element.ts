export function getFrameElement(el: Element) {
  const refWindow = el.ownerDocument.defaultView;

  if (refWindow && refWindow.self !== refWindow.parent) {
    return refWindow.frameElement;
  }

  return null;
}
