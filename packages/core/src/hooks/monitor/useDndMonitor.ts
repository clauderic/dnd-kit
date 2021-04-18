import {createContext, useContext, useEffect, useRef} from 'react';

import {Action} from '../../store';
import type {
  DragStartEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
} from '../../types';

export interface Arguments {
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragCancelEvent): void;
}

export interface DndMonitorState {
  type: Action | null;
  event:
    | null
    | DragStartEvent
    | DragMoveEvent
    | DragOverEvent
    | DragEndEvent
    | DragCancelEvent;
}

export const DndMonitorContext = createContext<DndMonitorState>({
  type: null,
  event: null,
});

export function useDndMonitor({
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel,
}: Arguments) {
  const monitorState = useContext(DndMonitorContext);
  const previousMonitorState = useRef(monitorState);

  useEffect(() => {
    if (monitorState !== previousMonitorState.current) {
      const {type, event} = monitorState;

      switch (type) {
        case Action.DragStart:
          onDragStart?.(event as DragStartEvent);
          break;
        case Action.DragMove:
          onDragMove?.(event as DragMoveEvent);
          break;
        case Action.DragOver:
          onDragOver?.(event as DragOverEvent);
          break;
        case Action.DragCancel:
          onDragCancel?.(event as DragCancelEvent);
          break;
        case Action.DragEnd:
          onDragEnd?.(event as DragEndEvent);
          break;
      }

      previousMonitorState.current = monitorState;
    }
  }, [
    monitorState,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onDragCancel,
  ]);
}
