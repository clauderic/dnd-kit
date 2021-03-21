import type {Coordinates, ClientRect, LayoutRect, ViewRect} from '../../types';
import {getScrollableAncestors, getScrollOffsets} from '../scroll';
import {defaultCoordinates} from '../coordinates';

function getEdgeOffset(
  node: HTMLElement | null,
  parent: (Node & ParentNode) | null,
  offset = defaultCoordinates
): Coordinates {
  if (!node || !(node instanceof HTMLElement)) {
    return offset;
  }

  const nodeOffset = {
    x: offset.x + node.offsetLeft,
    y: offset.y + node.offsetTop,
  };

  if (node.offsetParent === parent) {
    return nodeOffset;
  }

  return getEdgeOffset(node.offsetParent as HTMLElement, parent, nodeOffset);
}

export function getElementLayout(element: HTMLElement): LayoutRect {
  const {offsetWidth: width, offsetHeight: height} = element;
  const {x: offsetLeft, y: offsetTop} = getEdgeOffset(element, null);

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
  const scrollableAncestors = getScrollableAncestors(element.parentNode);
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
