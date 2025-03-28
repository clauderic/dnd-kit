export function isFocusable(element: Element) {
  const tagName = element.tagName.toLowerCase();

  return ['input', 'select', 'textarea', 'a', 'button'].includes(tagName);
}
