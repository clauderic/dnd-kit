import {getWindow} from '../execution-context/getWindow.ts';
import {isDocument} from '../type-guards/isDocument.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {isSVGElement} from '../type-guards/isSVGElement.ts';
import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isFixed} from './isFixed.ts';
import {isScrollable} from './isScrollable.ts';
import { isShadowRoot } from '../type-guards/isShadowRoot.ts';

interface Options {
  limit?: number;
  excludeElement?: boolean;
  escapeShadowDOM?: boolean; // if false, stop at shadowRoot; otherwise keep finding upwards outside shadow host
}

const defaultOptions: Options = {
  excludeElement: true,
  escapeShadowDOM: true,
};

export function getScrollableAncestors(
  element: Node | null,
  options: Options = defaultOptions
): Set<Element> {
  const {limit, excludeElement, escapeShadowDOM} = options;
  const scrollParents = new Set<Element>();

  function findScrollableAncestors(node: Node | null): Set<Element> {
    if (limit != null && scrollParents.size >= limit) {
      return scrollParents;
    }

    if (!node) {
      return scrollParents;
    }

    if (
      isDocument(node) &&
      node.scrollingElement != null &&
      !scrollParents.has(node.scrollingElement)
    ) {
      scrollParents.add(node.scrollingElement);

      return scrollParents;
    }

    if (escapeShadowDOM && isShadowRoot(node)){
      return findScrollableAncestors(node.host);
    }

    if (!isHTMLElement(node)) {
      if (isSVGElement(node)) {
        return findScrollableAncestors(node.parentElement);
      }

      return scrollParents;
    }

    if (scrollParents.has(node)) {
      return scrollParents;
    }

    const computedStyle = getComputedStyles(node, true);

    if (excludeElement && node === element) {
      // no-op
    } else if (isScrollable(node, computedStyle)) {
      scrollParents.add(node);
    }

    if (isFixed(node, computedStyle)) {
      const {scrollingElement} = node.ownerDocument;

      if (scrollingElement) scrollParents.add(scrollingElement);

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
