import type {Active, DroppableContainer} from '../../store';
import type {UniqueIdentifier, ViewRect} from '../../types';

export type CollisionDetection = (args: {
  active: Active;
  collisionRect: ViewRect;
  droppableContainers: DroppableContainer[];
}) => UniqueIdentifier | null;
