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

          // Defer to a microtask so a signal that changes while React is mid-commit does not
          // schedule a synchronous update from within a React lifecycle method — which triggers
          // the "useInsertionEffect must not schedule updates" warning and can crash
          // reconciliation. This happens, for example, when dnd-kit resets the drag operation
          // from a layout effect at drag end and a component reads that state via
          // `useDragOperation`. Mirrors the guard already present in `useDeepSignal`.
          if (sync) {
            queueMicrotask(() => flushSync(forceUpdate));
          } else {
            queueMicrotask(forceUpdate);
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
