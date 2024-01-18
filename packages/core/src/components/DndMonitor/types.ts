import type {
  DragStartEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
} from '../../types';

export interface DndMonitorListener<DraggableData, DroppableData> {
  onDragStart?(event: DragStartEvent<DraggableData>): void;
  onDragMove?(event: DragMoveEvent<DraggableData, DroppableData>): void;
  onDragOver?(event: DragOverEvent<DraggableData, DroppableData>): void;
  onDragEnd?(event: DragEndEvent<DraggableData, DroppableData>): void;
  onDragCancel?(event: DragCancelEvent<DraggableData, DroppableData>): void;
}

export interface DndMonitorEvent {
  type: keyof DndMonitorListener<never, never>;
  event:
    | DragStartEvent
    | DragMoveEvent
    | DragOverEvent
    | DragEndEvent
    | DragCancelEvent;
}

export type UnregisterListener = () => void;

export type RegisterListener<DraggableData, DroppableData> = (
  listener: DndMonitorListener<DraggableData, DroppableData>
) => UnregisterListener;
