import {useLazyMemo} from '@dnd-kit/utilities';
import type {DraggableNode} from '../../store';
import {UniqueIdentifier} from '../../types';

export function useCachedNode(
  draggableNode: DraggableNode | null,
  active: UniqueIdentifier | null
): DraggableNode['current'] {
  return useLazyMemo(
    (cachedNode) => {
      if (active === null) {
        return null;
      }

      // In some cases, the draggable node can unmount while dragging
      // This is the case for virtualized lists. In those situations,
      // we fall back to the last known value for that node.
      return draggableNode?.current ?? cachedNode ?? null;
    },
    [draggableNode, active]
  );
}
