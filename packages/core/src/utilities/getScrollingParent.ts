export function getScrollingParent(node: Node | null): Element | null {
  if (!node) {
    return null;
  }

  if (node instanceof Document) {
    return document.scrollingElement;
  }

  if (!(node instanceof HTMLElement) || node instanceof SVGElement) {
    return null;
  }

  if (isScrollable(node)) {
    return node;
  }

  return getScrollingParent(node.parentNode);
}

function isScrollable(node: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(node);
  const overflowRegex = /(auto|scroll)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return (
    properties.find((property) => {
      const value = computedStyle[property as keyof CSSStyleDeclaration];

      return typeof value === 'string' ? overflowRegex.test(value) : false;
    }) != null
  );
}
