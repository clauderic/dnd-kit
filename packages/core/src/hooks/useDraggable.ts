import {createContext, useContext, useEffect, useMemo} from 'react';
import {Transform, useNodeRef, useUniqueId} from '@dnd-kit/utilities';

import {Context, Data} from '../store';
import {ActiveDraggableContext} from '../components/DndContext';
import {
  useData,
  useSyntheticListeners,
  SyntheticListenerMap,
} from './utilities';

export interface UseDraggableArguments {
  id: string;
  data?: Data;
  disabled?: boolean;
  attributes?: {
    role?: string;
    roleDescription?: string;
    tabIndex?: number;
  };
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

const NullContext = createContext<any>(null);

const defaultRole = 'button';

const ID_PREFIX = 'Droppable';

export function useDraggable({
  id,
  data,
  disabled = false,
  attributes,
}: UseDraggableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {
    active,
    activeNodeRect,
    activatorEvent,
    ariaDescribedById,
    draggableNodes,
    droppableRects,
    activators,
    over,
  } = useContext(Context);
  const {role = defaultRole, roleDescription = 'draggable', tabIndex = 0} =
    attributes ?? {};
  const isDragging = active?.id === id;
  const transform: Transform | null = useContext(
    isDragging ? ActiveDraggableContext : NullContext
  );
  const [node, setNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useData(data);

  useEffect(
    () => {
      draggableNodes[id] = {id, key, node, data: dataRef};

      return () => {
        const node = draggableNodes[id];

        if (node && node.key === key) {
          delete draggableNodes[id];
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );

  const memoizedAttributes = useMemo(
    () => ({
      role,
      tabIndex,
      'aria-pressed': isDragging && role === defaultRole ? true : undefined,
      'aria-roledescription': roleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    }),
    [role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]
  );

  return {
    active,
    activeNodeRect,
    activatorEvent,
    attributes: memoizedAttributes,
    droppableRects,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    transform,
  };
}
