import {useEffect, useRef} from 'react';

export function useLatest<T>(value: T, dependencies: any[] = [value]) {
  const valueRef = useRef<T>(value);

  useEffect(
    () => {
      valueRef.current = value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );

  return valueRef;
}
