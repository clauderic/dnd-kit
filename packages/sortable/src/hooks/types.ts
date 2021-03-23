import type {UniqueIdentifier} from '@dnd-kit/core';
import type {Transition} from '@dnd-kit/utilities';

export type SortableTransition = Pick<Transition, 'easing' | 'duration'>;

export type AnimateLayoutChanges = (args: {
  isSorting: boolean;
  id: UniqueIdentifier;
  index: number;
  newIndex: number;
  items: UniqueIdentifier[];
  transition: SortableTransition | null;
}) => boolean;
