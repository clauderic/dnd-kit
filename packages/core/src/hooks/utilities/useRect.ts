import {useMemo, useRef} from 'react';
import {isHTMLElement, useLazyMemo} from '@dnd-kit/utilities';

import {
  Rect,
  getWindowClientRect,
  getTransformAgnosticClientRect,
} from '../../utilities/rect';
import type {ClientRect} from '../../types';

type RectFn<T> = (element: T) => ClientRect;

export const useClientRect = createUseRectFn(getTransformAgnosticClientRect);
export const useClientRects = createUseRectsFn(getTransformAgnosticClientRect);

export function useRect<T extends HTMLElement>(
  element: T | null,
  getRect: (element: T) => ClientRect,
  forceRecompute?: boolean
): Rect | null {
  const previousElement = useRef(element);

  return useLazyMemo<Rect | null>(
    (previousValue) => {
      if (!element) {
        return null;
      }

      if (
        forceRecompute ||
        (!previousValue && element) ||
        element !== previousElement.current
      ) {
        if (isHTMLElement(element) && element.parentNode == null) {
          return null;
        }

        return new Rect(getRect(element), element);
      }

      return previousValue ?? null;
    },
    [element, forceRecompute, getRect]
  );
}

export function createUseRectFn<T extends HTMLElement>(getRect: RectFn<T>) {
  return (element: T | null, forceRecompute?: boolean) =>
    useRect(element, getRect, forceRecompute);
}

function createUseRectsFn(getRect: RectFn<HTMLElement>) {
  const defaultValue: Rect[] = [];

  return function useRects(
    elements: HTMLElement[],
    forceRecompute?: boolean
  ): Rect[] {
    const previousElements = useRef(elements);

    return useLazyMemo<Rect[]>(
      (previousValue) => {
        if (!elements.length) {
          return defaultValue;
        }

        if (
          forceRecompute ||
          (!previousValue && elements.length) ||
          elements !== previousElements.current
        ) {
          return elements.map((element) => new Rect(getRect(element), element));
        }

        return previousValue ?? defaultValue;
      },
      [elements, forceRecompute]
    );
  };
}

export function useWindowRect(element: typeof window | null) {
  return useMemo(() => (element ? getWindowClientRect(element) : null), [
    element,
  ]);
}
