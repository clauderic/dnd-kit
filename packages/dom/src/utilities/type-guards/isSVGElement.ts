import {getWindow} from '../execution-context/getWindow.js';

export function isSVGElement(node: Node): node is SVGElement {
  return node instanceof getWindow(node).SVGElement;
}
