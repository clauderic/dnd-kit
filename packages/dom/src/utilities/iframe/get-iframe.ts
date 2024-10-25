export default function getIframe(el: Element) {
  const refWindow = el.ownerDocument.defaultView;

  if (refWindow && refWindow.self !== refWindow.parent) {
    const iframe = refWindow.frameElement as HTMLIFrameElement | null;

    return iframe;
  }

  return null;
}
