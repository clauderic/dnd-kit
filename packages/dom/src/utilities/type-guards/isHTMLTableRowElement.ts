export function isHTMLTableRowElement(
  element: Element
): element is HTMLTableRowElement {
  return element.tagName === 'TR';
}
