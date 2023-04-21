import type {ClientRect} from '@schuchertmanagementberatung/dnd-kit-core';
import type {Transform} from '@schuchertmanagementberatung/dnd-kit-utilities';

export type SortingStrategy = (args: {
  activeNodeRect: ClientRect | null;
  activeIndex: number;
  index: number;
  rects: ClientRect[];
  overIndex: number;
}) => Transform | null;
