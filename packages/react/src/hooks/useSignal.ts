import {useState} from 'react';
import {effect, signal, Signal} from '@dnd-kit/state';

import {useConstant} from './useConstant';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signalOrValue: T) {
  const sig = useConstant(() =>
    signalOrValue instanceof Signal ? signalOrValue : signal(signalOrValue)
  ) as T extends Signal ? T : Signal<T>;
  let val = sig.peek();
  const update = useState(val)[1];

  useIsomorphicLayoutEffect(
    () => effect(() => val !== (val = sig.value) && update(val)),
    []
  );
  return sig;
}
