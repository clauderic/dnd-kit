import {useContext} from 'react';
import {useNodeRef} from '@dropshift/utilities';

import {Context} from '../../store';
import {useSyntheticListeners, SyntheticListenerMap} from '../utilities';

export interface UseDraggableArguments {
  id: string;
  disabled?: boolean;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

export function useDraggable({id, disabled = false}: UseDraggableArguments) {
  const {active, activeRect, clientRects, activators, over} = useContext(
    Context
  );
  const [node, setNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id, node);
  const isDragging = Boolean(active?.id === id);

  return {
    active,
    activeRect,
    clientRects,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
  };
}
