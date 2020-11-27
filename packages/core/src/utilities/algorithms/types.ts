import {
  PositionalClientRectEntry,
  PositionalClientRect,
  UniqueIdentifier,
} from '../../types';

export type CollisionDetection = (
  clientRects: PositionalClientRectEntry[],
  clientRect: PositionalClientRect
) => UniqueIdentifier | null;
