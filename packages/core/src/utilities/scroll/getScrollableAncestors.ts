import {
  getWindow,
  isDocument,
  isHTMLElement,
  isSVGElement,
} from '@dnd-kit/utilities';

import {isFixed} from './isFixed';
import {isScrollable} from './isScrollable';

export function getScrollableAncestors(
  element: Node | null,
  limit?: number
): Element[] {
  const scrollParents: Element[] = [];

  function findScrollableAncestors(node: Node | null): Element[] {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }

    if (!node) {
      return scrollParents;
    }

    if (
      isDocument(node) &&
      node.scrollingElement != null &&
      !scrollParents.includes(node.scrollingElement)
    ) {
      scrollParents.push(node.scrollingElement);

      return scrollParents;
    }

    if (!isHTMLElement(node) || isSVGElement(node)) {
      return scrollParents;
    }

    if (scrollParents.includes(node)) {
      return scrollParents;
    }

    const computedStyle = getWindow(element).getComputedStyle(node);

    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }

    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }

    return findScrollableAncestors(node.parentNode);
  }

  if (!element) {
    return scrollParents;
  }

  return findScrollableAncestors(element);
}

export function getFirstScrollableAncestor(node: Node | null): Element | null {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);

  return firstScrollableAncestor ?? null;
}
