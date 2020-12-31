import {useRef} from 'react';
import {Transform, useLazyMemo} from '@dnd-kit/utilities';

import type {ViewRect} from '../../../types';

export function useDerivedTransform(
  transform: Transform,
  rect: ViewRect | null,
  overlayNode: HTMLElement | null
) {
  const prevRect = useRef(rect);

  return useLazyMemo<Transform | undefined>(
    (previousValue) => {
      const initial = prevRect.current;

      if (rect !== initial) {
        if (rect && initial) {
          const layoutHasChanged =
            initial.left !== rect.left || initial.top !== rect.top;

          if (layoutHasChanged && !previousValue) {
            const overlayNodeRect = overlayNode?.getBoundingClientRect();

            if (overlayNodeRect) {
              const delta = {
                ...transform,
                x: overlayNodeRect.left - rect.left,
                y: overlayNodeRect.top - rect.top,
              };

              return delta;
            }
          }
        }

        prevRect.current = rect;
      }

      return undefined;
    },
    [rect, transform, overlayNode]
  );
}
