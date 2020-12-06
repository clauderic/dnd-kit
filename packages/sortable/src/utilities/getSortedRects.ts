import type {
  PositionalClientRect,
  UniqueIdentifier,
  UseDndContextReturnValue,
} from '@dnd-kit/core';

export function getSortedRects(
  items: UniqueIdentifier[],
  clientRects: UseDndContextReturnValue['clientRects']
) {
  return items.reduce<PositionalClientRect[]>((accumulator, id) => {
    const clientRect = clientRects.get(id);

    if (clientRect) {
      accumulator.push(clientRect);
    }

    return accumulator;
  }, []);
}
