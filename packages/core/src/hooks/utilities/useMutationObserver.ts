import {useEffect, useMemo} from 'react';

interface Arguments {
  callback: MutationCallback;
  disabled?: boolean;
}

/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useMutationObserver({callback, disabled}: Arguments) {
  const mutationObserver = useMemo(() => {
    if (
      disabled ||
      typeof window === 'undefined' ||
      typeof window.MutationObserver === 'undefined'
    ) {
      return undefined;
    }

    const {MutationObserver} = window;

    return new MutationObserver(callback);
  }, [callback, disabled]);

  useEffect(() => {
    return () => mutationObserver?.disconnect();
  }, [mutationObserver]);

  return mutationObserver;
}
