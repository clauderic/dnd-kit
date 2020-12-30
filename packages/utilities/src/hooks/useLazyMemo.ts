import {useMemo, useRef} from 'react';

export function useLazyMemo<T>(
  callback: (prevValue: T | undefined) => T,
  dependencies: any[]
) {
  const valueRef = useRef<T>();

  return useMemo(
    () => {
      const newValue = callback(valueRef.current);
      valueRef.current = newValue;

      return newValue;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );
}
