import {getWindow} from '@dnd-kit/utilities';
import {hasOverflowStyles} from './hasOverflowStyles';

export function isScrollingEnabled(
  element: Element,
  computedStyle: CSSStyleDeclaration = getWindow(element).getComputedStyle(
    element
  )
): boolean {
  return hasOverflowStyles(element, computedStyle, /(auto|scroll|overlay)/);
}
