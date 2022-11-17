import type {
  DragStartEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
} from '../../types';

export interface DndMonitorListener {
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragCancelEvent): void;
}

export interface DndMonitorEvent {
  type: keyof DndMonitorListener;
  event:
    | DragStartEvent
    | DragMoveEvent
    | DragOverEvent
    | DragEndEvent
    | DragCancelEvent;
}

export type UnregisterListener = () => void;

export type RegisterListener = (
  listener: DndMonitorListener
) => UnregisterListener;
