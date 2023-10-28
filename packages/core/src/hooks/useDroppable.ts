import {useCallback, useContext, useEffect, useRef} from 'react';
import {
  useIsomorphicLayoutEffect,
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {InternalContext, Action, Data} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

import {useResizeObserver} from './utilities';

interface ResizeObserverConfig {
  /** Whether the ResizeObserver should be disabled entirely */
  disabled?: boolean;
  /** Resize events may affect the layout and position of other droppable containers.
   * Specify an array of `UniqueIdentifier` of droppable containers that should also be re-measured
   * when this droppable container resizes. Specifying an empty array re-measures all droppable containers.
   */
  updateMeasurementsFor?: UniqueIdentifier[];
  /** Represents the debounce timeout between when resize events are observed and when elements are re-measured */
  timeout?: number;
}

export interface UseDroppableArguments {
  id: UniqueIdentifier;
  disabled?: boolean;
  data?: Data;
  resizeObserverConfig?: ResizeObserverConfig;
}

const ID_PREFIX = 'Droppable';

const defaultResizeObserverConfig = {
  timeout: 25,
};

export function useDroppable({
  data,
  disabled = false,
  id,
  resizeObserverConfig,
}: UseDroppableArguments) {
  const key = useUniqueId(ID_PREFIX);
  const {
    dispatch,
    useMyOverForDroppable,
    measureDroppableContainers,
    useMyActiveForDroppable,
  } = useContext(InternalContext);
  const over = useMyOverForDroppable(id);
  const activeOverItem = useMyActiveForDroppable(id);
  const previous = useRef({disabled});
  const resizeObserverConnected = useRef(false);
  const rect = useRef<ClientRect | null>(null);
  const callbackId = useRef<NodeJS.Timeout | null>(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout,
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig,
  };
  const ids = useLatestValue(updateMeasurementsFor ?? id);
  const handleResize = useCallback(
    () => {
      if (!resizeObserverConnected.current) {
        // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
        // assuming the element is rendered and displayed.
        resizeObserverConnected.current = true;
        return;
      }

      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }

      callbackId.current = setTimeout(() => {
        measureDroppableContainers(
          Array.isArray(ids.current) ? ids.current : [ids.current]
        );
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    //the use of hasActive here forces all droppable to re-render when start/end drag.
    //are we sure it is needed to disable the resize observer when there is no active drag?
    disabled: resizeObserverDisabled,
  });
  const handleNodeChange = useCallback(
    (newElement: HTMLElement | null, previousElement: HTMLElement | null) => {
      if (!resizeObserver) {
        return;
      }

      if (previousElement) {
        resizeObserver.unobserve(previousElement);
        resizeObserverConnected.current = false;
      }

      if (newElement) {
        resizeObserver.observe(newElement);
      }
    },
    [resizeObserver]
  );
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);

  useEffect(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }

    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);

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

  useEffect(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });

      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, dispatch]);

  return {
    //I removed the active from here, it forces all droppable to re-render when active changes.
    activeOverItem,
    rect,
    isOver: !!over,
    node: nodeRef,
    over,
    setNodeRef,
  };
}
