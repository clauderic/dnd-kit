import {useMemo} from 'react';
import {useNodeRef} from '@dnd-kit/utilities';

import {getMeasurableNode} from '../../utilities/nodes';
import {getLayoutRect} from '../../utilities/rect';
import type {DndContextDescriptor} from '../../store';
import type {ViewRect} from '../../types';

import {createUseRectFn} from './useRect';

interface Arguments {
  disabled: boolean;
  forceRecompute: boolean;
}

// To-do: Delete and replace with `getViewRect` when https://github.com/clauderic/dnd-kit/pull/415 is merged
function getDragOverlayRect(element: HTMLElement): ViewRect {
  const {width, height, offsetLeft, offsetTop} = getLayoutRect(element);

  return {
    top: offsetTop,
    bottom: offsetTop + height,
    left: offsetLeft,
    right: offsetLeft + width,
    width,
    height,
    offsetTop,
    offsetLeft,
  };
}
const useDragOverlayRect = createUseRectFn(getDragOverlayRect);

export function useDragOverlayMeasuring({
  disabled,
  forceRecompute,
}: Arguments): DndContextDescriptor['dragOverlay'] {
  const [nodeRef, setRef] = useNodeRef();
  const rect = useDragOverlayRect(
    disabled ? null : getMeasurableNode(nodeRef.current),
    forceRecompute
  );

  return useMemo(
    () => ({
      nodeRef,
      rect,
      setRef,
    }),
    [rect, nodeRef, setRef]
  );
}
