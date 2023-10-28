import type {ClientRect} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';
import type {UniqueIdentifier} from 'packages/core/dist';

export type SortingStrategy = (args: {
  id: UniqueIdentifier;
  activeNodeRect: ClientRect | null;
  activeIndex: number;
  index: number;
  rects: ClientRect[];
  overIndex: number;
}) => Transform | null;
