import type {
  LayoutRect,
  UniqueIdentifier,
  UseDndContextReturnValue,
} from '@dnd-kit/core';

export function getSortedLayoutRects(
  items: UniqueIdentifier[],
  layoutRects: UseDndContextReturnValue['droppableLayoutRectsMap']
) {
  return items.reduce<LayoutRect[]>((accumulator, id, index) => {
    const layoutRect = layoutRects.get(id);

    if (layoutRect) {
      accumulator[index] = layoutRect;
    }

    return accumulator;
  }, Array(items.length));
}
