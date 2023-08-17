import {useRef, useEffect} from 'react';

export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void,
  effect = useEffect
) {
  const tracked = useRef(value);

  effect(() => {
    const oldValue = tracked.current;
    if (value !== tracked.current) {
      tracked.current = value;
      onChange(value, oldValue);
    }
  }, [onChange, value]);
}
