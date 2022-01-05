import type {Active, DroppableContainer} from '../../store';
import type {Coordinates, ClientRect, UniqueIdentifier} from '../../types';

export type Collision = [UniqueIdentifier, number];

export type CollisionDetection = (args: {
  active: Active;
  collisionRect: ClientRect;
  droppableContainers: DroppableContainer[];
  pointerCoordinates: Coordinates | null;
}) => Collision[];
