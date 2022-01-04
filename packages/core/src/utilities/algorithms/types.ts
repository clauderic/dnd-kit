import type {Active, DroppableContainer} from '../../store';
import type {UniqueIdentifier, ClientRect} from '../../types';

export type CollisionDetection = (args: {
  active: Active;
  collisionRect: ClientRect;
  droppableContainers: DroppableContainer[];
}) => UniqueIdentifier | null;
