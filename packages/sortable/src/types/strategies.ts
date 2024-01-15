import type {ClientRect, PublicContextDescriptor} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

export type SortingStrategy = (
  args: {
    activeNodeRect: ClientRect | null;
    activeIndex: number;
    index: number;
    rects: ClientRect[];
    overIndex: number;
  },
  context: PublicContextDescriptor
) => Transform | null;
