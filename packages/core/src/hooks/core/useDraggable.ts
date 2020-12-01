import {createContext, useContext} from 'react';
import {Transform, useNodeRef} from '@dnd-kit/utilities';

import {Context} from '../../store';
import {ActiveDraggableContext} from '../../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from '../utilities';

export interface UseDraggableArguments {
  id: string;
  disabled?: boolean;
  ariaRoleDescription?: string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const NullContext = createContext<any>(null);

export function useDraggable({
  id,
  disabled = false,
  ariaRoleDescription = 'draggable',
}: UseDraggableArguments) {
  const {
    active,
    activeRect,
    ariaDescribedById,
    clientRects,
    activators,
    over,
  } = useContext(Context);
  const isDragging = Boolean(active?.id === id);
  const transform: Transform | null = useContext(
    isDragging ? ActiveDraggableContext : NullContext
  );
  const [node, setNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id, node);

  return {
    active,
    activeRect,
    attributes: {
      role: 'button',
      'aria-pressed': isDragging ? true : undefined,
      'aria-roledescription': ariaRoleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    },
    clientRects,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    transform,
  };
}
