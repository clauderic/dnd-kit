import type {
  PositionalClientRectEntry,
  PositionalClientRect,
  UniqueIdentifier,
} from '../../types';

export type CollisionDetection = (
  entries: PositionalClientRectEntry[],
  target: PositionalClientRect
) => UniqueIdentifier | null;
