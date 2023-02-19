import {getWindow} from '@dnd-kit/utilities';

import type {ClientRect} from '../../types';
import {inverseTransform} from '../transform';

interface Options {
  ignoreTransform?: boolean;
}

const defaultOptions: Options = {ignoreTransform: false};

/**
 * Returns the bounding client rect of an element relative to the viewport.
 */
export function getClientRect(
  element: Element,
  options: Options = defaultOptions
) {
  let rect: ClientRect = element.getBoundingClientRect();

  if (options.ignoreTransform) {
    const {transform, transformOrigin} =
      getWindow(element).getComputedStyle(element);

    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }

  const {top, left, width, height, bottom, right} = rect;

  return {
    top,
    left,
    width,
    height,
    bottom,
    right,
  };
}

/**
 * Returns the bounding client rect of an element relative to the viewport.
 *
 * @remarks
 * The ClientRect returned by this method does not take into account transforms
 * applied to the element it measures.
 *
 */
export function getTransformAgnosticClientRect(element: Element): ClientRect {
  return getClientRect(element, {ignoreTransform: true});
}
