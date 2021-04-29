import type {ClientRect, LayoutRect, ViewRect} from '../../types';
import {getScrollableAncestors, getScrollOffsets} from '../scroll';

export function getElementLayout(element: HTMLElement): LayoutRect {
  const {offsetWidth: width, offsetHeight: height} = element;
  const {left: offsetLeft, top: offsetTop} = element.getBoundingClientRect();

  return {
    width,
    height,
    offsetTop,
    offsetLeft,
  };
}

export function getBoundingClientRect(
  element: HTMLElement | Window
): ClientRect {
  if (element instanceof Window) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      offsetTop: 0,
      offsetLeft: 0,
    };
  }

  const {offsetTop, offsetLeft} = getElementLayout(element);
  const {
    width,
    height,
    top,
    bottom,
    left,
    right,
  } = element.getBoundingClientRect();

  return {
    width,
    height,
    top,
    bottom,
    right,
    left,
    offsetTop,
    offsetLeft,
  };
}

export function getViewRect(element: HTMLElement): ViewRect {
  const {width, height, offsetTop, offsetLeft} = getElementLayout(element);
  const scrollableAncestors = getScrollableAncestors(element);
  const scrollOffsets = getScrollOffsets(scrollableAncestors);

  const top = offsetTop - scrollOffsets.y;
  const left = offsetLeft - scrollOffsets.x;

  return {
    width,
    height,
    top,
    bottom: top + height,
    right: left + width,
    left,
    offsetTop,
    offsetLeft,
  };
}
