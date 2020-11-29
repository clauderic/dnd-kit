import {createContext, useContext} from 'react';
import {Transform, useNodeRef} from '@dnd-kit/utilities';

import {Context} from '../../store';
import {ActiveDraggableContext} from '../../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from '../utilities';

export interface UseDraggableArguments {
  id: string;
  disabled?: boolean;
  ariaRole?: string;
  ariaRoleDescription?: string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const NullContext = createContext<any>(null);

export function useDraggable({
  id,
  disabled = false,
  ariaRole = 'button',
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
      'aria-role': ariaRole,
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
