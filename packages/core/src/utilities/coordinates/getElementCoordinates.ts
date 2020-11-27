import {Coordinates, PositionalClientRect} from '../../types';
import {defaultCoordinates} from './constants';

function getEdgeOffset(
  node: HTMLElement | null,
  parent: (Node & ParentNode) | null,
  offset = defaultCoordinates
): Coordinates {
  if (!node || !(node instanceof HTMLElement)) {
    return offset;
  }

  // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
  const nodeOffset = {
    x: offset.x + node.offsetLeft,
    y: offset.y + node.offsetTop,
  };

  if (node.offsetParent === parent) {
    return nodeOffset;
  }

  return getEdgeOffset(node.offsetParent as HTMLElement, parent, nodeOffset);
}

export function getElementCoordinates(
  element: HTMLElement
): PositionalClientRect {
  const {
    top,
    right,
    bottom,
    left,
    width,
    height,
  } = element.getBoundingClientRect();
  const {x: offsetLeft, y: offsetTop} = getEdgeOffset(element, null);

  return {top, right, bottom, left, width, height, offsetTop, offsetLeft};
}
