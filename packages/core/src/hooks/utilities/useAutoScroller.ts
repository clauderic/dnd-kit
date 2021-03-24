import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useInterval} from '@dnd-kit/utilities';

import {getScrollDirectionAndSpeed, defaultCoordinates} from '../../utilities';
import type {Coordinates, Direction, ViewRect} from '../../types';

export type ScrollAncestorSortingFn = (ancestors: Element[]) => Element[];

interface Arguments {
  canScroll?: CanScroll;
  enabled: boolean;
  interval?: number;
  order?: ScrollOrder;
  pointerCoordinates: Coordinates | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
}

export type CanScroll = (element: Element) => boolean;

export enum ScrollOrder {
  TreeOrder,
  ReversedTreeOrder,
}

interface ScrollDirection {
  x: 0 | Direction;
  y: 0 | Direction;
}

export function useAutoScroller({
  canScroll,
  enabled,
  interval = 5,
  order = ScrollOrder.ReversedTreeOrder,
  pointerCoordinates,
  scrollableAncestors,
  scrollableAncestorRects,
}: Arguments) {
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = useRef<Coordinates>({
    x: 1,
    y: 1,
  });
  const scrollDirection = useRef<ScrollDirection>(defaultCoordinates);
  const scrollContainerRef = useRef<Element | null>(null);
  const autoScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;

    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = useMemo(
    () =>
      order === ScrollOrder.ReversedTreeOrder
        ? [...scrollableAncestors].reverse()
        : scrollableAncestors,
    [order, scrollableAncestors]
  );

  useEffect(() => {
    if (!enabled || !scrollableAncestors.length || !pointerCoordinates) {
      clearAutoScrollInterval();
      return;
    }

    for (const scrollContainer of sortedScrollableAncestors) {
      if (canScroll?.(scrollContainer) === false) {
        continue;
      }

      const index = scrollableAncestors.indexOf(scrollContainer);
      const scrolllContainerRect = scrollableAncestorRects[index];

      if (!scrolllContainerRect) {
        continue;
      }

      const {direction, speed} = getScrollDirectionAndSpeed(
        scrollContainer,
        scrolllContainerRect,
        pointerCoordinates
      );

      if (speed.x > 0 || speed.y > 0) {
        clearAutoScrollInterval();

        scrollContainerRef.current = scrollContainer;
        setAutoScrollInterval(autoScroll, interval);

        scrollSpeed.current = speed;
        scrollDirection.current = direction;

        return;
      }
    }

    scrollSpeed.current = {x: 0, y: 0};
    scrollDirection.current = {x: 0, y: 0};
    clearAutoScrollInterval();
  }, [
    autoScroll,
    canScroll,
    clearAutoScrollInterval,
    enabled,
    interval,
    pointerCoordinates,
    setAutoScrollInterval,
    scrollableAncestors,
    sortedScrollableAncestors,
    scrollableAncestorRects,
  ]);
}
