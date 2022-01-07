import {useContext, useEffect, useRef} from 'react';
import {
  useIsomorphicLayoutEffect,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {Context, Action, Data} from '../store';
import type {ClientRect} from '../types';
import {useData} from './utilities';

export interface UseDroppableArguments {
  id: string;
  disabled?: boolean;
  data?: Data;
}

const ID_PREFIX = 'Droppable';

export function useDroppable({
  data,
  disabled = false,
  id,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {active, collisions, dispatch, over} = useContext(Context);
  const rect = useRef<ClientRect | null>(null);
  const [nodeRef, setNodeRef] = useNodeRef();
  const dataRef = useData(data);

  useIsomorphicLayoutEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef,
        },
      });

      return () =>
        dispatch({
          type: Action.UnregisterDroppable,
          key,
          id,
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  useEffect(
    () => {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );

  return {
    active,
    collisions,
    rect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
