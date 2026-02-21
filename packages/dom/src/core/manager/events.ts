import type {DragDropEvents} from '@dnd-kit/abstract';

import type {Draggable} from '../entities/draggable/draggable.ts';
import type {Droppable} from '../entities/droppable/droppable.ts';
import type {DragDropManager} from './manager.ts';

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export type CollisionEvent = Parameters<Events['collision']>[0];
export type BeforeDragStartEvent = Parameters<Events['beforedragstart']>[0];
export type DragStartEvent = Parameters<Events['dragstart']>[0];
export type DragMoveEvent = Parameters<Events['dragmove']>[0];
export type DragOverEvent = Parameters<Events['dragover']>[0];
export type DragEndEvent = Parameters<Events['dragend']>[0];
