import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useInterval, useLazyMemo, usePrevious} from '@dnd-kit/utilities';

import {getScrollDirectionAndSpeed} from '../../utilities';
import type {ClientRect, Coordinates} from '../../types';
import {Direction} from '../../types';

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
  layoutShiftCompensation?:
    | boolean
    | {
        x: boolean;
        y: boolean;
      };
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
  delta: Coordinates;
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

type DirectionValue = -1 | 0 | 1;

export interface AutoScrollState {
  isScrolling: boolean;
  direction: {
    x: DirectionValue;
    y: DirectionValue;
  };
}

const initialAutoScrollState = (): AutoScrollState => ({
  isScrolling: false,
  direction: {
    x: 0,
    y: 0,
  },
});

function useAutoScrollInterval() {
  const [setInterval, clearInterval] = useInterval();
  const [state, setState] = useState(initialAutoScrollState);

  return {
    setAutoScrollInterval: (
      listener: Function,
      duration: number,
      direction: ScrollDirection
    ) => {
      setInterval(listener, duration);
      setState({
        isScrolling: true,
        direction,
      });
    },
    clearAutoScrollInterval: () => {
      clearInterval();
      setState({
        isScrolling: true,
        direction: {x: 0, y: 0},
      });
    },
    state,
  };
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
  delta,
  threshold,
}: Arguments) {
  const scrollIntent = useScrollIntent({delta, disabled: !enabled});
  const {
    setAutoScrollInterval,
    clearAutoScrollInterval,
    state: autoScrollState,
  } = useAutoScrollInterval();
  const scrollSpeed = useRef<Coordinates>({x: 0, y: 0});
  const scrollDirection = useRef<ScrollDirection>({x: 0, y: 0});
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
  }, [activator, draggingRect, pointerCoordinates]);
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

        for (const axis of ['x', 'y'] as const) {
          if (!scrollIntent[axis][direction[axis] as Direction]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }

        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();

          scrollContainerRef.current = scrollContainer;
          setAutoScrollInterval(autoScroll, interval, direction);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(scrollIntent),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold),
    ]
  );

  return autoScrollState;
}

interface ScrollIntent {
  x: Record<Direction, boolean>;
  y: Record<Direction, boolean>;
}

const defaultScrollIntent: ScrollIntent = {
  x: {[Direction.Backward]: false, [Direction.Forward]: false},
  y: {[Direction.Backward]: false, [Direction.Forward]: false},
};

function useScrollIntent({
  delta,
  disabled,
}: {
  delta: Coordinates;
  disabled: boolean;
}): ScrollIntent {
  const previousDelta = usePrevious(delta);

  return useLazyMemo<ScrollIntent>(
    (previousIntent) => {
      if (disabled || !previousDelta || !previousIntent) {
        // Reset scroll intent tracking when auto-scrolling is disabled
        return defaultScrollIntent;
      }

      const direction = {
        x: Math.sign(delta.x - previousDelta.x),
        y: Math.sign(delta.y - previousDelta.y),
      };

      // Keep track of the user intent to scroll in each direction for both axis
      return {
        x: {
          [Direction.Backward]:
            previousIntent.x[Direction.Backward] || direction.x === -1,
          [Direction.Forward]:
            previousIntent.x[Direction.Forward] || direction.x === 1,
        },
        y: {
          [Direction.Backward]:
            previousIntent.y[Direction.Backward] || direction.y === -1,
          [Direction.Forward]:
            previousIntent.y[Direction.Forward] || direction.y === 1,
        },
      };
    },
    [disabled, delta, previousDelta]
  );
}
