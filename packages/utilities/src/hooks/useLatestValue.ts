import {useRef} from 'react';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useLatestValue<T extends any>(value: T) {
  const valueRef = useRef<T>(value);

  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, [value]);

  return valueRef;
}
