import {getWindow} from '../execution-context/getWindow.ts';
import {isNode} from './isNode.ts';

export function isElement(target: EventTarget | null): target is Element {
  if (!target) return false;

  return (
    target instanceof getWindow(target).Element ||
    (isNode(target) && target.nodeType === Node.ELEMENT_NODE)
  );
}
