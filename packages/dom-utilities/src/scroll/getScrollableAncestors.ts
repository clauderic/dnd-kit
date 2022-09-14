import {getWindow} from '../execution-context';
import {isDocument, isHTMLElement, isSVGElement} from '../type-guards';

import {isFixed} from './isFixed';
import {isScrollable} from './isScrollable';

interface Options {
  limit?: number;
  excludeElement?: boolean;
}

const defaultOptions: Options = {
  excludeElement: true,
};

export function getScrollableAncestors(
  element: Node | null,
  options: Options = defaultOptions
): Element[] {
  const {limit, excludeElement} = options;
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

    const {getComputedStyle} = getWindow(node);
    const computedStyle = getComputedStyle(node);

    if (excludeElement && node === element) {
      // no-op
    } else if (isScrollable(node, computedStyle)) {
      scrollParents.push(node);
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
  const [firstScrollableAncestor] = getScrollableAncestors(node, {limit: 1});

  return firstScrollableAncestor ?? null;
}
