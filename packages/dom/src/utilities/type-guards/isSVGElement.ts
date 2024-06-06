import {getWindow} from '../execution-context/getWindow.ts';

export function isSVGElement(node: Node): node is SVGElement {
  return node instanceof getWindow(node).SVGElement;
}
