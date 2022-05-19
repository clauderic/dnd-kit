import {useEffect} from 'react';
import {
  findFirstFocusableNode,
  isKeyboardEvent,
  usePrevious,
} from '@dnd-kit/utilities';

import type {DraggableNodes} from '../../../store';
import type {UniqueIdentifier} from '../../../types';

interface Arguments {
  activeId: UniqueIdentifier | null;
  activatorEvent: Event | null;
  disabled: boolean;
  draggableNodes: DraggableNodes;
}

export function useRestoreFocus({
  activeId,
  activatorEvent,
  disabled,
  draggableNodes,
}: Arguments) {
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(activeId);

  // Restore keyboard focus on the activator node
  useEffect(() => {
    if (disabled) {
      return;
    }

    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!isKeyboardEvent(previousActivatorEvent)) {
        return;
      }

      if (document.activeElement === previousActivatorEvent.target) {
        // No need to restore focus
        return;
      }

      const draggableNode = draggableNodes[previousActiveId];

      if (!draggableNode) {
        return;
      }

      const {node, activatorNode} = draggableNode;

      for (const element of [node.current, activatorNode.current]) {
        if (!element) {
          continue;
        }

        const focusableNode = findFirstFocusableNode(element);

        if (focusableNode) {
          focusableNode.focus();
          break;
        }
      }
    }
  }, [
    activatorEvent,
    disabled,
    draggableNodes,
    previousActiveId,
    previousActivatorEvent,
  ]);
}
