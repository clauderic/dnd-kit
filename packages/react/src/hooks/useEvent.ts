import {useCallback} from 'react';

import {useLatest} from './useLatest';

export function useEvent<T extends Function>(handler: T | undefined) {
  const handlerRef = useLatest(handler);

  return useCallback(
    function (...args: any) {
      return handlerRef.current?.(...args);
    },
    [handlerRef]
  );
}
