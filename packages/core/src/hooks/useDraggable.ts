import {useMemo} from 'react';
import {
  Transform,
  useNodeRef,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@schuchertmanagementberatung/dnd-kit-utilities';
import type {Data} from '../store';
import type {UniqueIdentifier} from '../types';
import {useSyntheticListeners, SyntheticListenerMap} from './utilities';
import {
  useActiveDraggableContextStore,
  useInternalContextStore,
} from '../store/new-store';
import {shallow} from 'zustand/shallow';

export interface UseDraggableArguments {
  id: UniqueIdentifier;
  data?: Data;
  disabled?: boolean;
  attributes?: {
    role?: string;
    roleDescription?: string;
    tabIndex?: number;
  };
}

export interface DraggableAttributes {
  role: string;
  tabIndex: number;
  'aria-disabled': boolean;
  'aria-pressed': boolean | undefined;
  'aria-roledescription': string;
  'aria-describedby': string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

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
    activators,
    activatorEvent,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    activeId,
  } = useInternalContextStore(
    (state) => ({
      activators: state.activators,
      activatorEvent: state.activatorEvent,
      activeNodeRect: state.activeNodeRect,
      ariaDescribedById: state.ariaDescribedById,
      draggableNodes: state.draggableNodes,
      activeId: state.active?.id,
    }),
    shallow
  );
  const {
    role = defaultRole,
    roleDescription = 'draggable',
    tabIndex = 0,
  } = attributes ?? {};
  const isDragging = activeId === id;
  const activeDraggableTransform = useActiveDraggableContextStore();
  const transform: Transform | null = isDragging
    ? activeDraggableTransform
    : null;
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);

  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {id, key, node, activatorNode, data: dataRef});

      return () => {
        const node = draggableNodes.get(id);

        if (node && node.key === key) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );

  const memoizedAttributes: DraggableAttributes = useMemo(
    () => ({
      role,
      tabIndex,
      'aria-disabled': disabled,
      'aria-pressed': isDragging && role === defaultRole ? true : undefined,
      'aria-roledescription': roleDescription,
      'aria-describedby': ariaDescribedById.draggable,
    }),
    [
      disabled,
      role,
      tabIndex,
      isDragging,
      roleDescription,
      ariaDescribedById.draggable,
    ]
  );

  return {
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    setNodeRef,
    setActivatorNodeRef,
    transform,
  };
}
