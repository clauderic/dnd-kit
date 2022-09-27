import {useRef} from 'react';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useLatestValue<T extends any>(
  value: T,
  dependencies: unknown[] = [value]
) {
  const valueRef = useRef<T>(value);

  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);

  return valueRef;
}
