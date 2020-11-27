import {useContext, useEffect, useRef} from 'react';
import {useIsomorphicEffect, useNodeRef} from '@dropshift/utilities';

import {Context, Events, Data} from '../../store';
import {PositionalClientRect} from '../../types';
// import {useScrollingParent} from '../utilities';
// import {getElementCoordinates} from '../../utilities';

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
  // const handleNodeChange = useCallback((node: HTMLElement | null) => {
  //   clientRect.current = node ? getElementCoordinates(node) : null;
  // }, []);
  const [nodeRef, setNodeRef] = useNodeRef({
    // onChange: handleNodeChange,
  });
  // const scrollingParent = useScrollingParent(nodeRef.current);
  const dataRef = useRef(data);

  useIsomorphicEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
    }
  }, [data]);

  // useLayoutEffect(() => {
  //   clientRect.current = nodeRef.current
  //     ? getElementCoordinates(nodeRef.current)
  //     : null;
  // }, [nodeRef, scrollingParent]);

  useEffect(() => {
    if (!disabled) {
      dispatch({
        type: Events.RegisterDroppable,
        element: {
          id,
          node: nodeRef,
          clientRect,
          data: dataRef,
        },
      });
    } else {
      dispatch({
        type: Events.UnregisterDroppable,
        id,
      });
    }

    return () =>
      dispatch({
        type: Events.UnregisterDroppable,
        id,
      });
  }, [id, clientRect, nodeRef, disabled, dispatch]);

  return {
    clientRect,
    isOver: over?.id === id,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
