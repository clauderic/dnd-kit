import type {Coordinates} from '@dnd-kit/geometry';

export function getElementFromPoint(
  document: Document,
  {x, y}: Coordinates
): Element | null {
  const element = document.elementFromPoint(x, y);

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
