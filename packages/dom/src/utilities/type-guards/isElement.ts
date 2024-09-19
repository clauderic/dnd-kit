import {getWindow} from '../execution-context/getWindow.ts';

export function isElement(target: EventTarget | null): target is Element {
  return target instanceof getWindow(target).Element;
}
