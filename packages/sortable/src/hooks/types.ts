import type {
  Active,
  UniqueIdentifier,
} from '@schuchertmanagementberatung/dnd-kit-core';
import type {Transition} from '@schuchertmanagementberatung/dnd-kit-utilities';

export type SortableTransition = Pick<Transition, 'easing' | 'duration'>;

export type AnimateLayoutChanges = (args: {
  active: Active | null;
  containerId: UniqueIdentifier;
  isDragging: boolean;
  isSorting: boolean;
  id: UniqueIdentifier;
  index: number;
  items: UniqueIdentifier[];
  previousItems: UniqueIdentifier[];
  previousContainerId: UniqueIdentifier;
  newIndex: number;
  transition: SortableTransition | null;
  wasDragging: boolean;
}) => boolean;

export interface NewIndexGetterArguments {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  activeIndex: number;
  overIndex: number;
}

export type NewIndexGetter = (args: NewIndexGetterArguments) => number;
