import {useState} from 'react';
import {flushSync} from 'react-dom';
import {effect, signal, Signal} from '@dnd-kit/state';

import {useConstant} from './useConstant.js';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.js';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signalOrValue: T, sync = false) {
  const sig = useConstant(() =>
    signalOrValue instanceof Signal ? signalOrValue : signal(signalOrValue)
  ) as T extends Signal ? T : Signal<T>;
  let val = sig.peek();
  const update = useState(val)[1];

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        if (val !== (val = sig.value)) {
          if (sync) {
            flushSync(() => update(val));
          } else {
            update(val);
          }
        }
      }),
    [sync]
  );
  return sig;
}
