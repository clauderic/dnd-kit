import {getFrameElement} from '../frame/get-frame-element.ts';
import {parseTransform, Transform} from './parseTransform.ts';

const findTransformedEl = (
  el: Element,
  skipEl: boolean = false
): Element | null => {
  const styles = window.getComputedStyle(el);

  if (styles.transform !== 'none' && !skipEl) {
    return el;
  }

  if (!el.parentElement) {
    const frameElement = getFrameElement(el);

    if (frameElement) {
      return findTransformedEl(frameElement);
    }

    return null;
  }

  return findTransformedEl(el.parentElement);
};

export const getDeepTransform = (el: Element | null | undefined): Transform => {
  const currentTransform: Transform = {scaleX: 1, scaleY: 1, x: 0, y: 0, z: 0};

  if (!el) {
    return currentTransform;
  }

  let currentEl = findTransformedEl(el);

  while (currentEl) {
    const parsedTransform = parseTransform(window.getComputedStyle(currentEl));

    if (parsedTransform) {
      currentTransform.scaleX =
        currentTransform.scaleX * parsedTransform.scaleX;
      currentTransform.scaleY =
        currentTransform.scaleY * parsedTransform.scaleY;

      currentTransform.x = currentTransform.x + parsedTransform.x;
      currentTransform.y = currentTransform.y + parsedTransform.y;
      currentTransform.z = (currentTransform.z || 0) + (parsedTransform.z || 0);
    }

    currentEl = findTransformedEl(currentEl, true);
  }

  return currentTransform;
};
