import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {effect, Signal} from '@dnd-kit/state';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signal: Signal<T>, sync = false) {
  let val = signal.peek();
  const read = useRef(false);
  const update = useState(val)[1];

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        if (val !== (val = signal.value)) {
          if (!read.current) return;

          if (sync) {
            flushSync(() => update(val));
          } else {
            update(val);
          }
        }
      }),
    [signal, sync]
  );

  return {
    get value() {
      read.current = true;

      return signal.value;
    },
  };
}
