import type {LayoutRectEntry, ViewRect, UniqueIdentifier} from '../../types';

export type CollisionDetection = (
  entries: LayoutRectEntry[],
  target: ViewRect
) => UniqueIdentifier | null;
