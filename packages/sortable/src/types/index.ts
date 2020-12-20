import type {LayoutRect, ViewRect} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

export type SortingStrategy = (args: {
  activeNodeRect: ViewRect | null;
  activeIndex: number;
  index: number;
  layoutRects: LayoutRect[];
  overIndex: number;
}) => Transform | null;
