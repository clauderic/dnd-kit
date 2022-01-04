import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useInterval} from '@dnd-kit/utilities';

import {getScrollDirectionAndSpeed, defaultCoordinates} from '../../utilities';
import type {Coordinates, Direction, ClientRect} from '../../types';

export type ScrollAncestorSortingFn = (ancestors: Element[]) => Element[];

export enum AutoScrollActivator {
  Pointer,
  DraggableRect,
}

export interface Options {
  acceleration?: number;
  activator?: AutoScrollActivator;
  canScroll?: CanScroll;
  enabled?: boolean;
  interval?: number;
  order?: TraversalOrder;
  threshold?: {
    x: number;
    y: number;
  };
}

interface Arguments extends Options {
  draggingRect: ClientRect | null;
  enabled: boolean;
  pointerCoordinates: Coordinates | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
}

export type CanScroll = (element: Element) => boolean;

export enum TraversalOrder {
  TreeOrder,
  ReversedTreeOrder,
}

interface ScrollDirection {
  x: 0 | Direction;
  y: 0 | Direction;
}

export function useAutoScroller({
  acceleration,
  activator = AutoScrollActivator.Pointer,
  canScroll,
  draggingRect,
  enabled,
  interval = 5,
  order = TraversalOrder.TreeOrder,
  pointerCoordinates,
  scrollableAncestors,
  scrollableAncestorRects,
  threshold,
}: Arguments) {
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = useRef<Coordinates>({
    x: 1,
    y: 1,
  });
  const rect = useMemo(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates
          ? {
              top: pointerCoordinates.y,
              bottom: pointerCoordinates.y,
              left: pointerCoordinates.x,
              right: pointerCoordinates.x,
            }
          : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }

    return null;
  }, [activator, draggingRect, pointerCoordinates]);
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
      order === TraversalOrder.TreeOrder
        ? [...scrollableAncestors].reverse()
        : scrollableAncestors,
    [order, scrollableAncestors]
  );

  useEffect(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }

      for (const scrollContainer of sortedScrollableAncestors) {
        if (canScroll?.(scrollContainer) === false) {
          continue;
        }

        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];

        if (!scrollContainerRect) {
          continue;
        }

        const {direction, speed} = getScrollDirectionAndSpeed(
          scrollContainer,
          scrollContainerRect,
          rect,
          acceleration,
          threshold
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      acceleration,
      autoScroll,
      canScroll,
      clearAutoScrollInterval,
      enabled,
      interval,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(rect),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold),
    ]
  );
}
