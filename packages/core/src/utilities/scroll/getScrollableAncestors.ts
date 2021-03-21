import {isScrollable} from './isScrollable';

export function getScrollableAncestors(element: Node | null): Element[] {
  const scrollParents: Element[] = [];

  function findScrollableAncestors(node: Node | null): Element[] {
    if (!node) {
      return scrollParents;
    }

    if (node instanceof Document && node.scrollingElement != null) {
      scrollParents.push(node.scrollingElement);

      return scrollParents;
    }

    if (!(node instanceof HTMLElement) || node instanceof SVGElement) {
      return scrollParents;
    }

    if (isScrollable(node)) {
      scrollParents.push(node);
    }

    return findScrollableAncestors(node.parentNode);
  }

  return element ? findScrollableAncestors(element) : scrollParents;
}
