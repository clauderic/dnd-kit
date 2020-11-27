import {useState, useCallback} from 'react';
import {useOnValueChange} from '@dropshift/utilities';

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
  const scrollingElement = getScrollingElement(element);

  // TO-DO: Should probably throttle this
  const handleScroll = useCallback((event: Event) => {
    const scrollingElement = getScrollingElement(event.target);

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

  useOnValueChange(scrollingElement, (currentElement, previousElement) => {
    previousElement?.removeEventListener('scroll', handleScroll);

    if (currentElement) {
      const scrollCoordinates = getScrollCoordinates(currentElement);

      currentElement.addEventListener('scroll', handleScroll);

      setScrollCoordinates({
        initial: scrollCoordinates,
        current: scrollCoordinates,
        delta: defaultCoordinates,
      });
    } else {
      setScrollCoordinates(defaultState);
    }

    return () => {
      currentElement?.removeEventListener('scroll', handleScroll);
      previousElement?.removeEventListener('scroll', handleScroll);
    };
  });

  return scrollCoordinates;
}

function getScrollingElement(element: EventTarget | null) {
  if (element === document.scrollingElement || element instanceof Document) {
    return window;
  }

  if (element instanceof HTMLElement) {
    return element;
  }

  return null;
}
