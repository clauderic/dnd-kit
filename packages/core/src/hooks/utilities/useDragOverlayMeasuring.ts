import {useMemo, useCallback, useState} from 'react';
import {
  isHTMLElement,
  useNodeRef,
} from '@schuchertmanagementberatung/dnd-kit-utilities';

import {getMeasurableNode} from '../../utilities/nodes';
import type {PublicContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';
import useResizeObserver from '@react-hook/resize-observer';

interface Arguments {
  measure(element: HTMLElement): ClientRect;
}

export function useDragOverlayMeasuring({
  measure,
}: Arguments): PublicContextDescriptor['dragOverlay'] {
  const [rect, setRect] = useState<ClientRect | null>(null);
  const handleResize = useCallback(
    (entry) => {
      const target = entry.target;
      if (isHTMLElement(target)) {
        setRect((rect) => {
          const newRect = measure(target);

          return rect
            ? {...rect, width: newRect.width, height: newRect.height}
            : newRect;
        });
      }
    },
    [measure]
  );
  const handleNodeChange = useCallback(
    (element) => {
      const node = getMeasurableNode(element);
      setRect(node ? measure(node) : null);
    },
    [measure]
  );
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);
  useResizeObserver(nodeRef, handleResize);

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
    }),
    [rect, nodeRef, setRef]
  );
}
