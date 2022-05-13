import {useEffect, useMemo} from 'react';
import {useEvent} from '@dnd-kit/utilities';

interface Arguments {
  callback: MutationCallback;
  disabled?: boolean;
}

/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */
export function useMutationObserver({callback, disabled}: Arguments) {
  const handleMutations = useEvent(callback);
  const mutationObserver = useMemo(() => {
    if (
      disabled ||
      typeof window === 'undefined' ||
      typeof window.MutationObserver === 'undefined'
    ) {
      return undefined;
    }

    const {MutationObserver} = window;

    return new MutationObserver(handleMutations);
  }, [handleMutations, disabled]);

  useEffect(() => {
    return () => mutationObserver?.disconnect();
  }, [mutationObserver]);

  return mutationObserver;
}
