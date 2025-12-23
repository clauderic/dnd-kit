import {getWindow} from '../execution-context/getWindow.ts';
import {isNode} from './isNode.ts';

export function isShadowRoot(target: EventTarget | null): target is ShadowRoot {
  if (!target || !isNode(target)) return false;
  return target instanceof getWindow(target).ShadowRoot;
}
