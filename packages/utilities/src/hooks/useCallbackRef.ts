import {useEffect, useRef, useState} from 'react';
import type {Arguments} from '../types';

export function useCallbackRef<T extends Function>(callback: T) {
  const callbackRef = useRef<T>(callback);
  const [returnFunction] = useState(() => (...args: Arguments<T>) =>
    callbackRef.current(...args)
  );

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return returnFunction;
}
