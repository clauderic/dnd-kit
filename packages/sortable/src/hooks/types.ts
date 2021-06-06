import type {Active, UniqueIdentifier} from '@dnd-kit/core';
import type {Transition} from '@dnd-kit/utilities';

export type SortableTransition = Pick<Transition, 'easing' | 'duration'>;

export type AnimateLayoutChanges = (args: {
  active: Active | null;
  isDragging: boolean;
  isSorting: boolean;
  id: UniqueIdentifier;
  index: number;
  newIndex: number;
  items: UniqueIdentifier[];
  transition: SortableTransition | null;
  wasSorting: boolean;
}) => boolean;
