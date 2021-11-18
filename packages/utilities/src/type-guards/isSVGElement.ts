import {getWindow} from '../execution-context/getWindow';

export function isSVGElement(node: Node): node is SVGElement {
  return node instanceof getWindow(node).SVGElement;
}
