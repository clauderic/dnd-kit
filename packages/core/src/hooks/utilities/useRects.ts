import {useState} from 'react';
import {getWindow, useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

import type {ClientRect} from '../../types';
import {Rect, getClientRect} from '../../utilities/rect';
import {isDocumentScrollingElement} from '../../utilities';

import {useResizeObserver} from './useResizeObserver';
import {useWindowRect} from './useWindowRect';

const defaultValue: Rect[] = [];

export function useRects(
  elements: Element[],
  measure: (element: Element) => ClientRect = getClientRect
): ClientRect[] {
  const [firstElement] = elements;
  const windowRect = useWindowRect(
    firstElement ? getWindow(firstElement) : null
  );
  const [rects, setRects] = useState<ClientRect[]>(defaultValue);

  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue;
      }

      return elements.map((element) =>
        isDocumentScrollingElement(element)
          ? (windowRect as ClientRect)
          : new Rect(measure(element), element)
      );
    });
  }

  const resizeObserver = useResizeObserver({callback: measureRects});

  useIsomorphicLayoutEffect(() => {
    resizeObserver?.disconnect();
    measureRects();
    elements.forEach((element) => resizeObserver?.observe(element));
  }, [elements]);

  return rects;
}
