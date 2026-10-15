export function isFocusable(element: Element) {
  const tagName = element.tagName.toLowerCase();

  return ['input', 'select', 'textarea', 'a', 'button'].includes(tagName);
}

/**
 * The plugin sets `role="button"` on activators without a role, so a missing
 * role is treated as a button.
 */
export function supportsPressedState(element: Element) {
  return (element.getAttribute('role') ?? 'button') === 'button';
}
