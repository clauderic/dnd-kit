import type {DragDropEventMap} from '@dnd-kit/abstract';

import type {Draggable} from '../entities/draggable/draggable.ts';
import type {Droppable} from '../entities/droppable/droppable.ts';
import type {DragDropManager} from './manager.ts';

type Events = DragDropEventMap<Draggable, Droppable, DragDropManager>;

export type CollisionEvent = Events['collision'];
export type BeforeDragStartEvent = Events['beforedragstart'];
export type DragStartEvent = Events['dragstart'];
export type DragMoveEvent = Events['dragmove'];
export type DragOverEvent = Events['dragover'];
export type DragEndEvent = Events['dragend'];
