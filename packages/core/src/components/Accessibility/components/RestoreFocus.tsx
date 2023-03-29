import {useContext, useEffect} from 'react';
import {
  findFirstFocusableNode,
  isKeyboardEvent,
  usePrevious,
} from '@dnd-kit/utilities';

import {InternalContext} from '../../../store';

interface Props {
  disabled: boolean;
}

export function RestoreFocus({disabled}: Props) {
  const {useGloablActive, useGlobalActivatorEvent, draggableNodes} =
    useContext(InternalContext);
  const active = useGloablActive();
  const activatorEvent = useGlobalActivatorEvent();

  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active?.id);

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

      const draggableNode = draggableNodes.get(previousActiveId);

      if (!draggableNode) {
        return;
      }

      const {activatorNode, node} = draggableNode;

      if (!activatorNode.current && !node.current) {
        return;
      }

      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }

          const focusableNode = findFirstFocusableNode(element);

          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [
    activatorEvent,
    disabled,
    draggableNodes,
    previousActiveId,
    previousActivatorEvent,
  ]);

  return null;
}
