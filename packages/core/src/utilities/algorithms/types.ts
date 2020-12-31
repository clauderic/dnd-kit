import type {RectEntry, ViewRect, UniqueIdentifier} from '../../types';

export type CollisionDetection = (
  entries: RectEntry[],
  target: ViewRect
) => UniqueIdentifier | null;
