import {useEffect, useMemo} from 'react';

interface Arguments {
  disabled?: boolean;
  onResize: ResizeObserverCallback;
}

/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useResizeObserver({onResize, disabled}: Arguments) {
  const resizeObserver = useMemo(() => {
    if (
      disabled ||
      typeof window === 'undefined' ||
      typeof window.ResizeObserver === 'undefined'
    ) {
      return undefined;
    }

    const {ResizeObserver} = window;

    return new ResizeObserver(onResize);
  }, [disabled, onResize]);

  useEffect(() => {
    return () => resizeObserver?.disconnect();
  }, [resizeObserver]);

  return resizeObserver;
}
