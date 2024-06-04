import {useCallback, useState} from 'react';

import type {DndMonitorListener, DndMonitorEvent} from './types';

export function useDndMonitorProvider<DraggableData, DroppableData>() {
  const [listeners] = useState(
    () => new Set<DndMonitorListener<DraggableData, DroppableData>>()
  );

  const registerListener = useCallback(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [listeners]
  );

  const dispatch = useCallback(
    ({type, event}: DndMonitorEvent) => {
      listeners.forEach((listener) => listener[type]?.(event as any));
    },
    [listeners]
  );

  return [dispatch, registerListener] as const;
}
