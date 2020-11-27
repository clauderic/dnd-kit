import React, {useEffect} from 'react';
import {useCallbackRef} from './useCallbackRef';

export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void
) {
  const trackedRef = React.useRef(value);
  const handleChange = useCallbackRef(onChange);

  useEffect(() => {
    const oldValue = trackedRef.current;
    trackedRef.current = value;

    return handleChange(value, oldValue);
  }, [value, handleChange]);
}
