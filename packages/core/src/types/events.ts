import type {Active, Over} from '../store';
import type {Collision} from '../utilities/algorithms';

import type {Translate} from './coordinates';

interface DragEvent {
  activatorEvent: Event;
  active: Active;
  collisions: Collision[] | null;
  delta: Translate;
  over: Over | null;
}

export interface DragStartEvent extends Pick<DragEvent, 'active'> {}

export interface DragMoveEvent extends DragEvent {}

export interface DragOverEvent extends DragMoveEvent {}

export interface DragEndEvent extends DragEvent {}

export interface DragCancelEvent extends DragEndEvent {}
