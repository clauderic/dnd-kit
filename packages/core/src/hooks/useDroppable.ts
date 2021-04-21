import {useContext, useEffect, useRef} from 'react';
import {useIsomorphicLayoutEffect, useNodeRef} from '@dnd-kit/utilities';

import {Context, Action, Data} from '../store';
import type {ViewRect} from '../types';
import {useData} from './utilities';

export interface UseDroppableArguments {
  id: string;
  disabled?: boolean;
  data?: Data;
}

export function useDroppable({
  data,
  disabled = false,
  id,
}: UseDroppableArguments) {
  const {active, dispatch, over} = useContext(Context);
  const rect = useRef<ViewRect | null>(null);
  const [nodeRef, setNodeRef] = useNodeRef();
  const dataRef = useData(data);

  useIsomorphicLayoutEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef,
        },
      });

      return () =>
        dispatch({
          type: Action.UnregisterDroppable,
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
        disabled,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );

  return {
    active,
    rect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
