import {useRef} from 'react';
import {useIsomorphicLayoutEffect} from '@dnd-kit/utilities';

export function useLatestValue<T extends any>(data: T) {
  const dataRef = useRef<T>(data);

  useIsomorphicLayoutEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data;
    }
  }, [data]);

  return dataRef;
}
