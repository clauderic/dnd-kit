import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useInterval} from '@dnd-kit/utilities';

import {getScrollDirectionAndSpeed, defaultCoordinates} from '../../utilities';
import type {Coordinates, Direction, ViewRect} from '../../types';

interface Arguments {
  disabled: boolean;
  pointerCoordinates: Coordinates | null;
  interval?: number;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
}

interface ScrollDirection {
  x: 0 | Direction;
  y: 0 | Direction;
}

export function useAutoScroller({
  disabled,
  interval = 5,
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
  const reversedScrollAncestors = useMemo(
    () => [...scrollableAncestors].reverse(),
    [scrollableAncestors]
  );

  useEffect(() => {
    if (disabled || !scrollableAncestors.length || !pointerCoordinates) {
      clearAutoScrollInterval();
      return;
    }

    for (const scrollContainer of reversedScrollAncestors) {
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

      scrollSpeed.current = speed;
      scrollDirection.current = direction;

      clearAutoScrollInterval();

      if (speed.x > 0 || speed.y > 0) {
        scrollContainerRef.current = scrollContainer;
        setAutoScrollInterval(autoScroll, interval);

        break;
      }
    }
  }, [
    autoScroll,
    clearAutoScrollInterval,
    disabled,
    interval,
    pointerCoordinates,
    setAutoScrollInterval,
    scrollableAncestors,
    reversedScrollAncestors,
    scrollableAncestorRects,
  ]);
}
