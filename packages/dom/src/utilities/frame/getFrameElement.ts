export function getFrameElement(el: Element | undefined) {
  try {
    const refWindow = el?.ownerDocument.defaultView;

    if (refWindow && refWindow.self !== refWindow.parent) {
      return refWindow.frameElement;
    }
  } catch (_) {
  } finally {
    return null;
  }
}
