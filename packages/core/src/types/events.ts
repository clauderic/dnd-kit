import type {Active, Over} from '../store';
import type {Translate} from './coordinates';

interface DragEvent {
  active: Active;
  delta: Translate;
  over: Over | null;
}

export interface DragStartEvent extends Pick<DragEvent, 'active'> {}

export interface DragMoveEvent extends DragEvent {}

export interface DragOverEvent extends DragMoveEvent {}

export interface DragEndEvent extends DragEvent {}

export interface DragCancelEvent extends DragEndEvent {}
