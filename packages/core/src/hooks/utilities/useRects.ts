import {useRef} from 'react';
import {useLazyMemo} from '@dnd-kit/utilities';

import {Rect, getTransformAgnosticClientRect} from '../../utilities/rect';

const defaultValue: Rect[] = [];

export function useRects(
  elements: Element[],
  forceRecompute?: boolean,
  measure = getTransformAgnosticClientRect
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
        return elements.map((element) => new Rect(measure(element), element));
      }

      return previousValue ?? defaultValue;
    },
    [elements, measure, forceRecompute]
  );
}
