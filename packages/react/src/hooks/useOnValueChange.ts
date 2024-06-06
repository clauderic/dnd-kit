import {useRef, useEffect} from 'react';

export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void,
  effect = useEffect,
  compare = Object.is
) {
  const tracked = useRef<T>(value);

  effect(() => {
    const oldValue = tracked.current;

    if (!compare(value, oldValue)) {
      tracked.current = value;
      onChange(value, oldValue);
    }
  }, [onChange, value]);
}
