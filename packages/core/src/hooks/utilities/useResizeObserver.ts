import {useEffect, useMemo} from 'react';
import {useEvent} from '@dnd-kit/utilities';

interface Arguments {
  callback: ResizeObserverCallback;
  disabled?: boolean;
}

/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useResizeObserver({callback, disabled}: Arguments) {
  const handleResize = useEvent(callback);
  const resizeObserver = useMemo(
    () => {
      if (
        disabled ||
        typeof window === 'undefined' ||
        typeof window.ResizeObserver === 'undefined'
      ) {
        return undefined;
      }

      const {ResizeObserver} = window;

      return new ResizeObserver(handleResize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );

  useEffect(() => {
    return () => resizeObserver?.disconnect();
  }, [resizeObserver]);

  return resizeObserver;
}
