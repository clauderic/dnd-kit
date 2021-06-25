import type {DroppableContainer} from 'packages/core/dist/store';
import type {DraggingNode} from '../../store';
import type {UniqueIdentifier} from '../../types';

export type CollisionDetection = ({
  draggingNode,
  droppableContainers,
}: {
  draggingNode: DraggingNode;
  droppableContainers: DroppableContainer[];
}) => UniqueIdentifier | null;
