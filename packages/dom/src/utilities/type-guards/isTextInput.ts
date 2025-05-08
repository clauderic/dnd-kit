import {isElement} from './isElement.js';

export function isTextInput(target: EventTarget | null) {
  if (!isElement(target)) return false;

  const {tagName} = target;

  return (
    tagName === 'INPUT' || tagName === 'TEXTAREA' || isContentEditable(target)
  );
}

function isContentEditable(element: Element) {
  return (
    element.hasAttribute('contenteditable') &&
    element.getAttribute('contenteditable') !== 'false'
  );
}
