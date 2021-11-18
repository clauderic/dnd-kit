import {useRef} from 'react';
import {isHTMLElement, useLazyMemo} from '@dnd-kit/utilities';

import {getBoundingClientRect, getViewRect} from '../../utilities';
import type {LayoutRect} from '../../types';

type RectFn<T, U> = (element: U) => T;

export const useViewRect = createUseRectFn(getViewRect);
export const useClientRect = createUseRectFn(getBoundingClientRect);
export const useClientRects = createUseRectsFn(getBoundingClientRect);

export function useRect<
  T = LayoutRect,
  U extends Element | Window = HTMLElement
>(
  element: U | null,
  getRect: (element: U) => T,
  forceRecompute?: boolean
): T | null {
  const previousElement = useRef(element);

  return useLazyMemo<T | null>(
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

        return getRect(element as U);
      }

      return previousValue ?? null;
    },
    [element, forceRecompute, getRect]
  );
}

export function createUseRectFn<
  T = LayoutRect,
  U extends Element | Window = HTMLElement
>(getRect: RectFn<T, U>) {
  return (element: U | null, forceRecompute?: boolean) =>
    useRect(element, getRect, forceRecompute);
}

function createUseRectsFn<T = LayoutRect>(getRect: RectFn<T, HTMLElement>) {
  const defaultValue: T[] = [];

  return function useRects(elements: Element[], forceRecompute?: boolean): T[] {
    const previousElements = useRef(elements);

    return useLazyMemo<T[]>(
      (previousValue) => {
        if (!elements.length) {
          return defaultValue;
        }

        if (
          forceRecompute ||
          (!previousValue && elements.length) ||
          elements !== previousElements.current
        ) {
          return elements.map((element) => getRect(element as HTMLElement));
        }

        return previousValue ?? defaultValue;
      },
      [elements, forceRecompute]
    );
  };
}
