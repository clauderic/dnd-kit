import {createContext, useContext, useEffect} from 'react';
import {Transform, useNodeRef} from '@dnd-kit/utilities';

import {Context} from '../store';
import {ActiveDraggableContext} from '../components/DndContext';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';

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
    activatorEvent,
    ariaDescribedById,
    draggableNodes,
    droppableClientRects,
    activators,
    over,
  } = useContext(Context);
  const isDragging = Boolean(active?.id === id);
  const transform: Transform | null = useContext(
    isDragging ? ActiveDraggableContext : NullContext
  );
  const [node, setNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id, node);

  useEffect(
    () => {
      draggableNodes[id] = node;

      return () => {
        delete draggableNodes[id];
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );

  return {
    active,
    activeRect,
    activatorEvent,
    attributes: {
      role: 'button',
      'aria-pressed': isDragging ? true : undefined,
      'aria-roledescription': ariaRoleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    },
    droppableClientRects,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    transform,
  };
}
