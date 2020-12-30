import {useContext, useEffect, useRef} from 'react';
import {useIsomorphicLayoutEffect, useNodeRef} from '@dnd-kit/utilities';

import {Context, Action, Data} from '../store';
import type {LayoutRect} from '../types';

export interface UseDroppableArguments {
  id: string;
  disabled?: boolean;
  data?: Data;
}

const defaultData: Data = {};

export function useDroppable({
  data = defaultData,
  disabled = false,
  id,
}: UseDroppableArguments) {
  const {dispatch, over} = useContext(Context);
  const rect = useRef<LayoutRect | null>(null);
  const [nodeRef, setNodeRef] = useNodeRef();
  const dataRef = useRef(data);

  useIsomorphicLayoutEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
    }
  }, [data]);

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
    rect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
