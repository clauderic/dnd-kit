import type {PositionalClientRect} from '@dnd-kit/core';
import type {Transform} from '@dnd-kit/utilities';

export type SortingStrategy = (args: {
  clientRects: PositionalClientRect[];
  activeRect: PositionalClientRect | null;
  activeIndex: number;
  overIndex: number;
  index: number;
}) => Transform | undefined;
