import {
  closestCenter,
  defaultCoordinates,
  KeyCode,
  PositionalClientRectEntry,
  CoordinatesGetter,
} from '@dnd-kit/core';
import {subtract as getCoordinatesDelta} from '@dnd-kit/utilities';

import {clientRectSortingStrategy} from '../../strategies';
import {SortingStrategy} from '../../types';

const directions: string[] = [
  KeyCode.Down,
  KeyCode.Right,
  KeyCode.Up,
  KeyCode.Left,
];

export const getNextKeyboardCoordinates = (
  strategy: SortingStrategy
): CoordinatesGetter => (
  event,
  {
    active,
    context: {
      activeRect: fallbackActiveRect,
      clientRects: clientRectsMap,
      containerScroll,
      windowScroll,
      over,
    },
  }
) => {
  if (!over) {
    return;
  }

  if (directions.includes(event.code)) {
    event.preventDefault();

    const overRect = clientRectsMap.get(over.id);

    if (!overRect) {
      throw new Error('Over element does not have an associated clientRect');
    }

    const clientRects: PositionalClientRectEntry[] = [];

    clientRectsMap.forEach((clientRect, id) => {
      switch (event.code) {
        case KeyCode.Down:
          if (overRect.offsetTop + overRect.height <= clientRect.offsetTop) {
            clientRects.push([id, clientRect]);
          }
          break;
        case KeyCode.Up:
          if (overRect.offsetTop >= clientRect.offsetTop + clientRect.height) {
            clientRects.push([id, clientRect]);
          }
          break;
        case KeyCode.Left:
          if (overRect.offsetLeft >= clientRect.offsetLeft + clientRect.width) {
            clientRects.push([id, clientRect]);
          }
          break;
        case KeyCode.Right:
          if (overRect.offsetLeft + overRect.width <= clientRect.offsetLeft) {
            clientRects.push([id, clientRect]);
          }
          break;
      }
    });

    const closestId = closestCenter(clientRects, {
      ...overRect,
      top: overRect.offsetTop,
      left: overRect.offsetLeft,
    });

    if (closestId) {
      const newRect = clientRectsMap.get(closestId);

      if (newRect) {
        // We always want to try to get the latest rect for the active node
        // but for virtualized lists, we may need to fallback to the old cached
        // activeRect since the item may have unmounted out of the viewport
        const activeRect = clientRectsMap.get(active.id) ?? fallbackActiveRect;

        if (activeRect) {
          const adjustment =
            strategy === clientRectSortingStrategy
              ? defaultCoordinates
              : {
                  x:
                    newRect.offsetLeft > activeRect.offsetLeft
                      ? activeRect.width - newRect.width
                      : 0,
                  y:
                    newRect.offsetTop > activeRect.offsetTop
                      ? activeRect.height - newRect.height
                      : 0,
                };
          let newCoordinates = getCoordinatesDelta(
            {
              x: newRect.offsetLeft - adjustment.x,
              y: newRect.offsetTop - adjustment.y,
            },
            containerScroll.current,
            windowScroll.current
          );

          return newCoordinates;
        }
      }
    }
  }

  return undefined;
};
