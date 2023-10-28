import type {UniqueIdentifier} from '@dnd-kit/core';
import {useRef, useEffect} from 'react';

export function useGlobalActiveRef(activeId: UniqueIdentifier | null) {
  const activeState = useRef<{
    activeId: null | UniqueIdentifier;
    prevActiveId: null | UniqueIdentifier;
  }>({activeId: null, prevActiveId: null});

  activeState.current.activeId = activeId;

  useEffect(() => {
    if (activeId === activeState.current.prevActiveId) {
      return;
    }

    if (activeId && !activeState.current.prevActiveId) {
      activeState.current.prevActiveId = activeId;
      return;
    }

    const timeoutId = setTimeout(() => {
      activeState.current.prevActiveId = activeId;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [activeId]);

  return activeState;
}
