import {useContext, useEffect, useRef} from 'react';
import {useIsomorphicEffect, useNodeRef} from '@dnd-kit/utilities';

import {Context, Events, Data} from '../../store';
import {PositionalClientRect} from '../../types';

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
  const clientRect = useRef<PositionalClientRect | null>(null);
  const [nodeRef, setNodeRef] = useNodeRef();
  const dataRef = useRef(data);

  useIsomorphicEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
    }
  }, [data]);

  useIsomorphicEffect(
    () => {
      dispatch({
        type: Events.RegisterDroppable,
        element: {
          id,
          disabled,
          node: nodeRef,
          clientRect,
          data: dataRef,
        },
      });

      return () =>
        dispatch({
          type: Events.UnregisterDroppable,
          id,
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  useEffect(
    () => {
      dispatch({
        type: Events.SetDroppableDisabled,
        id,
        disabled,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );

  return {
    clientRect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
