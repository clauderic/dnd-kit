import {useRef} from 'react';

export function useConstant<T = any>(initializer: () => T) {
  const ref = useRef<T>();

  if (!ref.current) {
    ref.current = initializer();
  }

  return ref.current;
}
