import {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {add} from '@dnd-kit/utilities';

import {
  defaultCoordinates,
  getScrollableElement,
  getScrollCoordinates,
  getScrollOffsets,
} from '../../utilities';
import type {Coordinates} from '../../types';

type ScrollCoordinates = Map<HTMLElement | Window, Coordinates>;

export function useScrollOffsets(elements: Element[]): Coordinates {
  const [
    scrollCoordinates,
    setScrollCoordinates,
  ] = useState<ScrollCoordinates | null>(null);
  const prevElements = useRef(elements);

  // To-do: Throttle the handleScroll callback
  const handleScroll = useCallback((event: Event) => {
    const scrollingElement = getScrollableElement(event.target);

    if (!scrollingElement) {
      return;
    }

    setScrollCoordinates((scrollCoordinates) => {
      if (!scrollCoordinates) {
        return null;
      }

      scrollCoordinates.set(
        scrollingElement,
        getScrollCoordinates(scrollingElement)
      );

      return new Map(scrollCoordinates);
    });
  }, []);

  useEffect(() => {
    const previousElements = prevElements.current;

    if (elements !== previousElements) {
      cleanup(previousElements);

      const entries = elements
        .map((element) => {
          const scrollableElement = getScrollableElement(element);

          if (scrollableElement) {
            scrollableElement.addEventListener('scroll', handleScroll, {
              passive: true,
            });

            return [
              scrollableElement,
              getScrollCoordinates(scrollableElement),
            ] as const;
          }

          return null;
        })
        .filter(
          (
            entry
          ): entry is [
            HTMLElement | (Window & typeof globalThis),
            Coordinates
          ] => entry != null
        );

      setScrollCoordinates(entries.length ? new Map(entries) : null);

      prevElements.current = elements;
    }

    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };

    function cleanup(elements: Element[]) {
      elements.forEach((element) => {
        const scrollableElement = getScrollableElement(element);

        scrollableElement?.removeEventListener('scroll', handleScroll);
      });
    }
  }, [handleScroll, elements]);

  return useMemo(() => {
    if (elements.length) {
      return scrollCoordinates
        ? Array.from(scrollCoordinates.values()).reduce(
            (acc, coordinates) => add(acc, coordinates),
            defaultCoordinates
          )
        : getScrollOffsets(elements);
    }

    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}
