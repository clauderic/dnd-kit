import {useCallback, useEffect, useRef} from 'react';
import {useInterval} from '@dropshift/utilities';

import {
  getScrollDirectionAndSpeed,
  defaultCoordinates,
  getElementCoordinates,
} from '../../utilities';
import {Coordinates, Direction, PositionalClientRect} from '../../types';

interface Arguments {
  scrollingContainer: Element | null;
  adjustedClientRect: PositionalClientRect | null;
  interval?: number;
  disabled: boolean;
}

interface ScrollDirection {
  x: 0 | Direction;
  y: 0 | Direction;
}

export function useAutoScroller({
  adjustedClientRect,
  disabled,
  interval = 5,
  scrollingContainer,
}: Arguments) {
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollingContainerRect = useRef<PositionalClientRect | null>(null);
  const scrollSpeed = useRef<Coordinates>({
    x: 1,
    y: 1,
  });
  const scrollDirection = useRef<ScrollDirection>(defaultCoordinates);
  const autoScroll = useCallback(() => {
    if (!scrollingContainer) {
      return;
    }

    window.requestAnimationFrame(() => {
      const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
      const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;

      scrollingContainer.scrollBy(scrollLeft, scrollTop);
    });
  }, [scrollingContainer]);

  useEffect(() => {
    scrollingContainerRect.current = scrollingContainer
      ? getElementCoordinates(scrollingContainer as HTMLElement)
      : null;
  }, [scrollingContainer]);

  useEffect(() => {
    if (
      disabled ||
      !scrollingContainer ||
      !scrollingContainerRect.current ||
      !adjustedClientRect
    ) {
      clearAutoScrollInterval();
      return;
    }

    const {direction, speed} = getScrollDirectionAndSpeed(
      scrollingContainer,
      scrollingContainerRect.current,
      adjustedClientRect
    );
    scrollSpeed.current = speed;
    scrollDirection.current = direction;

    clearAutoScrollInterval();

    if (speed.x > 0 || speed.y > 0) {
      setAutoScrollInterval(autoScroll, interval);
    }
  }, [
    autoScroll,
    adjustedClientRect,
    clearAutoScrollInterval,
    disabled,
    setAutoScrollInterval,
    scrollingContainer,
    interval,
  ]);
}
