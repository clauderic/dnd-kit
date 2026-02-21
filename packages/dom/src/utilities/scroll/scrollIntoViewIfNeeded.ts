import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {getFirstScrollableAncestor} from './getScrollableAncestors.ts';

export function scrollIntoViewIfNeeded(el: Element, centerIfNeeded = false) {
  if (!isHTMLElement(el)) {
    return;
  }

  const parent = getFirstScrollableAncestor(el);

  if (!isHTMLElement(parent)) {
    return;
  }

  const parentComputedStyle = getComputedStyles(parent, true),
    parentBorderTopWidth = parseInt(
      parentComputedStyle.getPropertyValue('border-top-width')
    ),
    parentBorderLeftWidth = parseInt(
      parentComputedStyle.getPropertyValue('border-left-width')
    ),
    overTop = el.offsetTop - parent.offsetTop < parent.scrollTop,
    overBottom =
      el.offsetTop - parent.offsetTop + el.clientHeight - parentBorderTopWidth >
      parent.scrollTop + parent.clientHeight,
    overLeft = el.offsetLeft - parent.offsetLeft < parent.scrollLeft,
    overRight =
      el.offsetLeft -
        parent.offsetLeft +
        el.clientWidth -
        parentBorderLeftWidth >
      parent.scrollLeft + parent.clientWidth,
    alignWithTop = overTop && !overBottom;

  if ((overTop || overBottom) && centerIfNeeded) {
    parent.scrollTop =
      el.offsetTop -
      parent.offsetTop -
      parent.clientHeight / 2 -
      parentBorderTopWidth +
      el.clientHeight / 2;
  }

  if ((overLeft || overRight) && centerIfNeeded) {
    parent.scrollLeft =
      el.offsetLeft -
      parent.offsetLeft -
      parent.clientWidth / 2 -
      parentBorderLeftWidth +
      el.clientWidth / 2;
  }

  if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
    if (alignWithTop) {
      parent.scrollTop = el.offsetTop - parent.offsetTop;
    } else if (overBottom) {
      parent.scrollTop =
        el.offsetTop -
        parent.offsetTop +
        el.clientHeight -
        parent.clientHeight;
    }

    if (overLeft) {
      parent.scrollLeft = el.offsetLeft - parent.offsetLeft;
    } else if (overRight) {
      parent.scrollLeft =
        el.offsetLeft -
        parent.offsetLeft +
        el.clientWidth -
        parent.clientWidth;
    }
  }
}
