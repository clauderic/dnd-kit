import {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {
  useIsomorphicLayoutEffect,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {Context, Action, Data} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';
import {useLatestValue} from './utilities';

interface ResizeObserverConfig {
  disabled?: boolean;
  timeout?: number;
  recomputeIds?: UniqueIdentifier[];
}

export interface UseDroppableArguments {
  id: UniqueIdentifier;
  disabled?: boolean;
  data?: Data;
  resizeObserverConfig?: ResizeObserverConfig;
}

const ID_PREFIX = 'Droppable';

const defaultResizeObserverConfig = {
  timeout: 50,
};

export function useDroppable({
  data,
  disabled = false,
  id,
  resizeObserverConfig,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {active, collisions, dispatch, over, recomputeRects} = useContext(
    Context
  );
  const rect = useRef<ClientRect | null>(null);
  const resizeEventCount = useRef(0);
  const callbackId = useRef<NodeJS.Timeout | null>(null);
  const {
    disabled: resizeObserverDisabled,
    recomputeIds,
    timeout: resizeObserverTimeout,
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig,
  };
  const recomputeIdsRef = useLatestValue(recomputeIds);
  const handleResize = useCallback(
    () => {
      const isFirstResizeEvent = resizeEventCount.current === 0;

      resizeEventCount.current++;

      if (isFirstResizeEvent) {
        return;
      }

      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }

      callbackId.current = setTimeout(() => {
        callbackId.current = null;

        recomputeRects(recomputeIdsRef.current ?? []);
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [recomputeRects, resizeObserverTimeout]
  );
  const resizeObserver = useMemo(
    () => (resizeObserverDisabled ? null : new ResizeObserver(handleResize)),
    [handleResize, resizeObserverDisabled]
  );
  const handleNodeChange = useCallback(
    (newElement: HTMLElement | null, previousElement: HTMLElement | null) => {
      if (!resizeObserver) {
        return;
      }

      if (previousElement) {
        resizeObserver.unobserve(previousElement);
      }

      if (newElement) {
        resizeObserver.observe(newElement);
      }
    },
    [resizeObserver]
  );
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);

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
