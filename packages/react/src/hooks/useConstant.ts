import {useRef} from 'react';

export function useConstant<T = any>(initializer: () => T, dependency?: any) {
  const ref = useRef<T>();
  const previousDependency = useRef(dependency);

  if (!ref.current) {
    ref.current = initializer();
  }

  if (previousDependency.current !== dependency) {
    previousDependency.current = dependency;
    ref.current = initializer();
  }

  return ref.current;
}
