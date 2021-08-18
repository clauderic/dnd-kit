import {useMemo, useRef} from 'react';
import {Transform, useNodeRef} from '@dnd-kit/utilities';

import {getMeasurableNode} from '../../utilities/nodes';
import type {DndContextDescriptor} from '../../store';
import type {ClientRect} from '../../types';

import {useClientRect} from './useRect';

interface Arguments {
  disabled: boolean;
  forceRecompute: boolean;
}

export function useDragOverlayMeasuring({
  disabled,
  forceRecompute,
}: Arguments): DndContextDescriptor['dragOverlay'] {
  const transform = useRef<Transform | null>(null);
  const [nodeRef, setRef] = useNodeRef();
  const measuredOverlayRect = useClientRect(
    disabled ? null : getMeasurableNode(nodeRef.current),
    forceRecompute
  );

  const rect = useMemo(() => {
    return measuredOverlayRect && transform.current
      ? add(measuredOverlayRect, transform.current)
      : null;
  }, [measuredOverlayRect]);

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
      transform,
    }),
    [rect, transform, nodeRef, setRef]
  );
}

function add(rect: ClientRect, transform: Transform) {
  return {
    ...rect,
    left: Math.round(rect.left - transform.x),
    right: Math.round(rect.right - transform.x),
    top: Math.round(rect.top - transform.y),
    bottom: Math.round(rect.bottom - transform.y),
  };
}
