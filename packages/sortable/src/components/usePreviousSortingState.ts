import type {UniqueIdentifier} from '@dnd-kit/core';
import {useRef, useEffect} from 'react';
export type SortableState = {
  activeId: UniqueIdentifier | null;
  items: UniqueIdentifier[];
  containerId: string;
};

export function usePreviousSortingStateRef(sortingState: SortableState) {
  const previous = useRef(sortingState);

  const activeId = sortingState.activeId;
  useEffect(() => {
    if (activeId === previous.current.activeId) {
      return;
    }

    if (activeId && !previous.current.activeId) {
      previous.current.activeId = activeId;
      return;
    }

    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [activeId]);

  const {items, containerId} = sortingState;
  useEffect(() => {
    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }

    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [activeId, containerId, items]);

  return previous;
}
