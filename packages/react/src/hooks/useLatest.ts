import {useRef} from 'react';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useLatest<T>(value: T) {
  const valueRef = useRef<T | undefined>(value);

  useIsomorphicLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}
