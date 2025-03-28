export function supportsStyle(
  element: Element
): element is Element & {style: CSSStyleDeclaration} {
  return (
    'style' in element &&
    typeof element.style === 'object' &&
    element.style !== null &&
    'setProperty' in element.style &&
    'removeProperty' in element.style &&
    typeof element.style.setProperty === 'function' &&
    typeof element.style.removeProperty === 'function'
  );
}
