import type {Active, Over, AnyData} from '../store';
import type {Collision} from '../utilities/algorithms';

import type {Translate} from './coordinates';

interface DragEvent<DraggableData = AnyData, DroppableData = AnyData> {
  activatorEvent: Event;
  active: Active<DraggableData>;
  collisions: Collision[] | null;
  delta: Translate;
  over: Over<DroppableData> | null;
}

export interface DragStartEvent<DraggableData = AnyData>
  extends Pick<DragEvent<DraggableData, never>, 'active'> {}

export interface DragMoveEvent<DraggableData = AnyData, DroppableData = AnyData>
  extends DragEvent<DraggableData, DroppableData> {}

export interface DragOverEvent<DraggableData = AnyData, DroppableData = AnyData>
  extends DragEvent<DraggableData, DroppableData> {}

export interface DragEndEvent<DraggableData = AnyData, DroppableData = AnyData>
  extends DragEvent<DraggableData, DroppableData> {}

export interface DragCancelEvent<
  DraggableData = AnyData,
  DroppableData = AnyData
> extends DragEvent<DraggableData, DroppableData> {}
