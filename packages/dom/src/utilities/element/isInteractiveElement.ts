export function isInteractiveElement(element: Element): boolean {
  return Boolean(
    element.closest(`
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      button:not([disabled]),
      a[href],
      [contenteditable]:not([contenteditable="false"])
    `)
  );
}
