import type {Coordinates} from '@dnd-kit/geometry';

export function getElementFromPoint(
  root: Document | ShadowRoot,
  {x, y}: Coordinates
): Element | null {
  const element = root.elementFromPoint(x, y); //supported by both document and shadowRoot.

  if (isIFrameElement(element)) {
    const {contentDocument} = element;

    if (contentDocument) {
      const {left, top} = element.getBoundingClientRect();

      return getElementFromPoint(contentDocument, {
        x: x - left,
        y: y - top,
      });
    }
  }

  return element;
}

function isIFrameElement(
  element: Element | null
): element is HTMLIFrameElement {
  return element?.tagName === 'IFRAME';
}
