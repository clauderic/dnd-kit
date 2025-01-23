import {useRef} from 'react';

export function useConstant<T = any>(initializer: () => T) {
  const ref = useRef<T>(null);

  if (!ref.current) {
    ref.current = initializer();
  }

  return ref.current;
}
