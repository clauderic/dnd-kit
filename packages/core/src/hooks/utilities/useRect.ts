import {useReducer} from 'react';
import {useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

import type {ClientRect} from '../../types';
import {getClientRect} from '../../utilities';

import {useMutationObserver} from './useMutationObserver';
import {useResizeObserver} from './useResizeObserver';

export function useRect(
  element: HTMLElement | null,
  measure: (element: HTMLElement) => ClientRect = getClientRect
) {
  const [rect, measureRect] = useReducer(reducer, null);
  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }

      for (const record of records) {
        const {type, target} = record;

        if (
          type === 'childList' &&
          target instanceof HTMLElement &&
          target.contains(element)
        ) {
          measureRect();
          break;
        }
      }
    },
  });
  const resizeObserver = useResizeObserver({callback: measureRect});

  useIsomorphicLayoutEffect(() => {
    measureRect();

    if (element) {
      resizeObserver?.observe(element);
      mutationObserver?.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    }
  }, [element]);

  return rect;

  function reducer(currentRect: ClientRect | null) {
    if (!element) {
      return null;
    }

    const newRect = measure(element);

    if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
      return currentRect;
    }

    return newRect;
  }
}
