import {useLazyMemo} from '@dnd-kit/utilities';

import type {DraggableNode, DraggableNodes} from '../../store';
import type {UniqueIdentifier} from '../../types';

export function useCachedNode(
  draggableNodes: DraggableNodes,
  id: UniqueIdentifier | null
): DraggableNode['node']['current'] {
  const draggableNode = id !== null ? draggableNodes.get(id) : undefined;
  const node = draggableNode ? draggableNode.node.current : null;

  return useLazyMemo(
    (cachedNode) => {
      if (id === null) {
        return null;
      }

      // In some cases, the draggable node can unmount while dragging
      // This is the case for virtualized lists. In those situations,
      // we fall back to the last known value for that node.
      return node ?? cachedNode ?? null;
    },
    [node, id]
  );
}
