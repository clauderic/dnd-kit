import type {
  Active,
  AnyData,
  Data,
  DroppableContainer,
  RectMap,
} from '../../store';
import type {Coordinates, ClientRect, UniqueIdentifier} from '../../types';

export interface Collision {
  id: UniqueIdentifier;
  data?: Data;
}

export interface CollisionDescriptor<DroppableData> extends Collision {
  data: {
    droppableContainer: DroppableContainer<DroppableData>;
    value: number;
    [key: string]: any;
  };
}

export type CollisionDetection<
  DraggableData = AnyData,
  DroppableData = AnyData
> = (args: {
  active: Active<DraggableData>;
  collisionRect: ClientRect;
  droppableRects: RectMap;
  droppableContainers: DroppableContainer<DroppableData>[];
  pointerCoordinates: Coordinates | null;
}) => Collision[];
