import {isWindow} from '../type-guards/isWindow.ts';
import {isNode} from '../type-guards/isNode.ts';

export function getWindow(
  target: Event['target'] | null | undefined
): typeof window {
  if (!target) {
    return window;
  }

  if (isWindow(target)) {
    return target;
  }

  if (!isNode(target)) {
    return window;
  }

  if ('defaultView' in target) {
    return (target.defaultView as typeof window | null) ?? window;
  }

  return target.ownerDocument?.defaultView ?? window;
}
