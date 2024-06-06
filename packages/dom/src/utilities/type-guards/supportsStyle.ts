import {getWindow} from '../execution-context/getWindow.ts';

export function supportsStyle(
  element: Element
): element is Element & {style: CSSStyleDeclaration} {
  return (
    'style' in element &&
    element.style instanceof getWindow(element).CSSStyleDeclaration
  );
}
