import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {effect, Signal} from '@dnd-kit/state';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {useForceUpdate} from './useForceUpdate.ts';

/** Trigger a re-render when reading a signal. */
export function useSignal<T = any>(signal: Signal<T>, sync = false) {
  const previous = useRef(signal.peek());
  const read = useRef(false);
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        const previousValue = previous.current;
        const currentValue = signal.value;

        if (previousValue !== currentValue) {
          previous.current = currentValue;

          if (!read.current) return;

          if (sync) {
            flushSync(forceUpdate);
          } else {
            forceUpdate();
          }
        }
      }),
    [signal, sync, forceUpdate]
  );

  return {
    get value() {
      read.current = true;

      return signal.peek();
    },
  };
}
