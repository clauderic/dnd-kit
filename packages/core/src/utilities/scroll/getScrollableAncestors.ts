import {isFixed} from './isFixed';
import {isScrollable} from './isScrollable';

export function getScrollableAncestors(element: Node | null): Element[] {
  const scrollParents: Element[] = [];

  function findScrollableAncestors(node: Node | null): Element[] {
    if (!node) {
      return scrollParents;
    }

    if (
      node instanceof Document &&
      node.scrollingElement != null &&
      !scrollParents.includes(node.scrollingElement)
    ) {
      scrollParents.push(node.scrollingElement);

      return scrollParents;
    }

    if (!(node instanceof HTMLElement) || node instanceof SVGElement) {
      return scrollParents;
    }

    if (scrollParents.includes(node)) {
      return scrollParents;
    }

    const computedStyle = window.getComputedStyle(node);

    if (isScrollable(node, computedStyle)) {
      scrollParents.push(node);
    }

    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }

    return findScrollableAncestors(node.parentNode);
  }

  return element ? findScrollableAncestors(element.parentNode) : scrollParents;
}
