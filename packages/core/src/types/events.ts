import type {LayoutRect, Translate} from './coordinates';
import type {Active, UniqueIdentifier} from './other';

interface DragEvent {
  active: Active & {
    rect: {
      initial: LayoutRect;
      translated: LayoutRect;
    };
  };
  delta: Translate;
  over: {
    id: UniqueIdentifier;
    rect: LayoutRect;
  } | null;
}

export interface DragStartEvent {
  active: Active;
}

export interface DragMoveEvent extends DragEvent {}

export interface DragOverEvent extends DragMoveEvent {}

export interface DragEndEvent extends DragEvent {}

export interface DragCancelEvent extends DragEndEvent {}
