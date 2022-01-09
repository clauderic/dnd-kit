import {useMemo, useCallback, useState, useRef} from 'react';
import {
  isHTMLElement,
  useIsomorphicLayoutEffect,
  useNodeRef,
} from '@dnd-kit/utilities';

import {getMeasurableNode} from '../../utilities/nodes';
import {getClientRect} from '../../utilities/rect';
import type {PublicContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';

interface Arguments {
  measure?(element: HTMLElement): ClientRect;
}

export function useDragOverlayMeasuring({
  measure = getClientRect,
}: Arguments): PublicContextDescriptor['dragOverlay'] {
  const [rect, setRect] = useState<ClientRect | null>(null);
  const measureRef = useRef(measure);
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
  const resizeObserver = useMemo(() => new ResizeObserver(handleResize), [
    handleResize,
  ]);
  const handleNodeChange = useCallback(
    (element) => {
      const node = getMeasurableNode(element);

      resizeObserver.disconnect();

      if (node) {
        resizeObserver.observe(node);
      }

      setRect(node ? measure(node) : null);
    },
    [measure, resizeObserver]
  );
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);

  useIsomorphicLayoutEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
    }),
    [rect, nodeRef, setRef]
  );
}
