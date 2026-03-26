import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {getScrollableAncestors} from './getScrollableAncestors.ts';

type ScrollPosition = 'center' | 'nearest' | 'none';

interface ScrollIntoViewOptions {
  block?: ScrollPosition;
  inline?: ScrollPosition;
}

export function scrollIntoViewIfNeeded(
  el: Element,
  {block = 'nearest', inline = 'nearest'}: ScrollIntoViewOptions = {}
) {
  if (!isHTMLElement(el)) {
    return;
  }

  const scrollableAncestors = getScrollableAncestors(el);
  const processedAncestors: HTMLElement[] = [];

  for (const ancestor of scrollableAncestors) {
    if (!isHTMLElement(ancestor)) {
      continue;
    }

    const {top, left} = getOffsetRelativeTo(el, ancestor);

    // For outer scrollable containers, adjust for the scroll positions
    // of intermediate (already-processed) scrollable containers so that
    // we compute where the element *visually* appears rather than where
    // it sits in the layout.
    let adjustedTop = top;
    let adjustedLeft = left;

    for (const inner of processedAncestors) {
      adjustedTop -= inner.scrollTop;
      adjustedLeft -= inner.scrollLeft;
    }

    if (block !== 'none') {
      const overTop = adjustedTop < ancestor.scrollTop;
      const overBottom =
        adjustedTop + el.offsetHeight >
        ancestor.scrollTop + ancestor.clientHeight;

      if (overTop !== overBottom) {
        if (block === 'center') {
          ancestor.scrollTop =
            adjustedTop - ancestor.clientHeight / 2 + el.offsetHeight / 2;
        } else if (overTop) {
          ancestor.scrollTop = adjustedTop;
        } else {
          ancestor.scrollTop =
            adjustedTop + el.offsetHeight - ancestor.clientHeight;
        }
      }
    }

    if (inline !== 'none') {
      const overLeft = adjustedLeft < ancestor.scrollLeft;
      const overRight =
        adjustedLeft + el.offsetWidth >
        ancestor.scrollLeft + ancestor.clientWidth;

      if (overLeft !== overRight) {
        if (inline === 'center') {
          ancestor.scrollLeft =
            adjustedLeft - ancestor.clientWidth / 2 + el.offsetWidth / 2;
        } else if (overLeft) {
          ancestor.scrollLeft = adjustedLeft;
        } else {
          ancestor.scrollLeft =
            adjustedLeft + el.offsetWidth - ancestor.clientWidth;
        }
      }
    }

    processedAncestors.push(ancestor);
  }
}

/**
 * Computes the absolute layout offset of an element's border-box
 * by walking the offsetParent chain. The result is independent of
 * any scroll positions.
 *
 * Note: SVG elements are not currently supported. If an SVG element
 * is encountered in the offsetParent chain, the walk stops early.
 */
function getDocumentOffset(element: HTMLElement): {top: number; left: number} {
  let top = 0;
  let left = 0;
  let current: HTMLElement | null = element;

  while (current) {
    top += current.offsetTop;
    left += current.offsetLeft;

    const offsetParent: Element | null = current.offsetParent;

    if (!isHTMLElement(offsetParent)) {
      break;
    }

    // clientTop/clientLeft are the border widths of the offsetParent.
    // Add them to bridge from the offsetParent's padding edge (where
    // offsetTop is measured from) to its border-box edge so the next
    // iteration's offsetTop accumulates correctly.
    top += offsetParent.clientTop;
    left += offsetParent.clientLeft;

    current = offsetParent;
  }

  return {top, left};
}

/**
 * Returns the element's border-box position relative to the ancestor's
 * padding edge (content area), which is the coordinate space that
 * scrollTop / scrollLeft operate in.
 */
function getOffsetRelativeTo(
  element: HTMLElement,
  ancestor: HTMLElement
): {top: number; left: number} {
  const elOffset = getDocumentOffset(element);
  const ancestorOffset = getDocumentOffset(ancestor);

  return {
    top: elOffset.top - ancestorOffset.top - ancestor.clientTop,
    left: elOffset.left - ancestorOffset.left - ancestor.clientLeft,
  };
}
