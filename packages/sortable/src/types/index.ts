import type {PositionalClientRect} from '@dropshift/core';
import type {Transform} from '@dropshift/utilities';

export type SortingStrategy = (args: {
  clientRects: PositionalClientRect[];
  activeRect: PositionalClientRect | null;
  activeIndex: number;
  overIndex: number;
  index: number;
}) => Transform | undefined;
