import type {Point, Shape} from '@dnd-kit/geometry';
import type {UniqueIdentifier} from '@dnd-kit/types';

import type {DragOperation} from '../manager';
import type {Draggable, Droppable} from '../nodes';

export enum CollisionPriority {
  Low,
  Medium,
  High,
}

export interface Collision {
  id: UniqueIdentifier;
  priority: CollisionPriority | number;
  value: number;
}

export type Collisions = Collision[];

export interface CollisionDetectorInput<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  droppable: U;
  dragOperation: DragOperation<T, U>;
}

export type CollisionDetector = <
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
>(
  input: CollisionDetectorInput<T, U>
) => Collision | null;
