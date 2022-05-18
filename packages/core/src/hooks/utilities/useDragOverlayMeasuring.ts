import {useMemo, useCallback, useState} from 'react';
import {isHTMLElement, useNodeRef} from '@dnd-kit/utilities';

import {useResizeObserver} from './useResizeObserver';
import {getMeasurableNode} from '../../utilities/nodes';
import type {PublicContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';

interface Arguments {
  measure(element: HTMLElement): ClientRect;
}

export function useDragOverlayMeasuring({
  measure,
}: Arguments): PublicContextDescriptor['dragOverlay'] {
  const [rect, setRect] = useState<ClientRect | null>(null);
  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      for (const {target} of entries) {
        if (isHTMLElement(target)) {
          setRect((rect) => {
            const newRect = measure(target);

            return rect
              ? {...rect, width: newRect.width, height: newRect.height}
              : newRect;
          });
          break;
        }
      }
    },
    [measure]
  );
  const resizeObserver = useResizeObserver({callback: handleResize});
  const handleNodeChange = useCallback(
    (element) => {
      const node = getMeasurableNode(element);

      resizeObserver?.disconnect();

      if (node) {
        resizeObserver?.observe(node);
      }

      setRect(node ? measure(node) : null);
    },
    [measure, resizeObserver]
  );
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
    }),
    [rect, nodeRef, setRef]
  );
}
