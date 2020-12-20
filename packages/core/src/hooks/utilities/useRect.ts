import {useRef} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {
  getBoundingClientRect,
  getElementLayout,
  getViewRect,
} from '../../utilities';
import type {LayoutRect} from '../../types';

type RectFn<T, U> = (element: U) => T;

export const useClientRect = createUseRectFn(getBoundingClientRect);
export const useClientRects = createUseRectsFn(getBoundingClientRect);
export const useViewRect = createUseRectFn(getViewRect);
export const useLayoutRect = createUseRectFn(getElementLayout);

function createUseRectFn<T = LayoutRect, U = HTMLElement>(
  getRect: RectFn<T, U>
) {
  return function useClientRect(
    element: U | null,
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
          if (element instanceof HTMLElement && element.parentNode == null) {
            return null;
          }

          return getRect(element as U);
        }

        return previousValue ?? null;
      },
      [element, forceRecompute]
    );
  };
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
