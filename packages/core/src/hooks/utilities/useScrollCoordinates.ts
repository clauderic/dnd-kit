import {useState, useCallback, useRef, useEffect} from 'react';
import {canUseDOM} from '@dnd-kit/utilities';

import {defaultCoordinates, getScrollCoordinates} from '../../utilities';
import type {ScrollCoordinates} from '../../types';

const defaultState: ScrollCoordinates = {
  initial: defaultCoordinates,
  current: defaultCoordinates,
  delta: defaultCoordinates,
};

export function useScrollCoordinates(
  element: Element | null
): ScrollCoordinates {
  const [scrollCoordinates, setScrollCoordinates] = useState(defaultState);
  const scrollingElement = getScrollableElement(element);
  const prevScrollingElement = useRef(scrollingElement);

  // TO-DO: Should probably throttle this
  const handleScroll = useCallback((event: Event) => {
    const scrollingElement = getScrollableElement(event.target);

    if (!scrollingElement) {
      return;
    }

    const scrollCoordinates = getScrollCoordinates(scrollingElement);

    setScrollCoordinates(({initial}) => {
      const scrollDelta = {
        x: scrollCoordinates.x - initial.x,
        y: scrollCoordinates.y - initial.y,
      };

      return {
        initial,
        current: scrollCoordinates,
        delta: scrollDelta,
      };
    });
  }, []);

  useEffect(() => {
    const previousElement = prevScrollingElement.current;

    if (scrollingElement !== previousElement) {
      previousElement?.removeEventListener('scroll', handleScroll);

      if (scrollingElement) {
        const scrollCoordinates = getScrollCoordinates(scrollingElement);

        scrollingElement.addEventListener('scroll', handleScroll);

        setScrollCoordinates({
          initial: scrollCoordinates,
          current: scrollCoordinates,
          delta: defaultCoordinates,
        });
      } else {
        setScrollCoordinates(defaultState);
      }

      prevScrollingElement.current = scrollingElement;
    }

    return () => {
      scrollingElement?.removeEventListener('scroll', handleScroll);
      previousElement?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollingElement]);

  return scrollCoordinates;
}

function getScrollableElement(element: EventTarget | null) {
  if (!canUseDOM) {
    return null;
  }

  if (element === document.scrollingElement || element instanceof Document) {
    return window;
  }

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}
