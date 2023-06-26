import {useCallback, useEffect, useRef} from 'react';
import {
  useIsomorphicLayoutEffect,
  useLatestValue,
  useNodeRef,
  useUniqueId,
} from '@schuchertmanagementberatung/dnd-kit-utilities';

import type {Data} from '../store';
import type {ClientRect, UniqueIdentifier} from '../types';

// import {useResizeObserver} from './utilities';
import {
  InternalContextStore,
  useDndKitStore,
  useInternalContextStore,
} from '../store/new-store';
import {shallow} from 'zustand/shallow';
import useResizeObserver from '@react-hook/resize-observer';
import {noop} from '../utilities';

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
  const {registerDroppable, setDroppableDisabled, unregisterDroppable} =
    useDndKitStore(
      (state) => ({
        registerDroppable: state.registerDroppable,
        setDroppableDisabled: state.setDroppableDisabled,
        unregisterDroppable: state.unregisterDroppable,
      }),
      shallow
    );
  const {isActive, measureDroppableContainers} = useInternalContextStore(
    (state: InternalContextStore) => ({
      isActive: !!state.active,
      measureDroppableContainers: state.measureDroppableContainers,
    }),
    shallow
  );
  const previous = useRef({disabled});
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
  const [nodeRef, setNodeRef] = useNodeRef();
  const isResizeObserverDisabled = resizeObserverDisabled || !isActive;
  useResizeObserver(nodeRef, isResizeObserverDisabled ? noop : handleResize);
  const dataRef = useLatestValue(data);

  useIsomorphicLayoutEffect(
    () => {
      registerDroppable({
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
        unregisterDroppable({
          key,
          id,
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  useEffect(() => {
    if (disabled !== previous.current.disabled) {
      setDroppableDisabled({
        id,
        key,
        disabled,
      });

      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, setDroppableDisabled]);

  return {
    rect,
    node: nodeRef,
    setNodeRef,
  };
}
