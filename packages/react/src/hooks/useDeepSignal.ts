import {useMemo} from 'react';
import {flushSync} from 'react-dom';
import {effect, signal, untracked} from '@dnd-kit/state';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {useForceUpdate} from './useForceUpdate.ts';
import {useLatest} from './useLatest.ts';

/** Trigger a re-render when reading signal properties of an object. */
export function useDeepSignal<T extends object | null | undefined>(
  target: T,
  synchronous?: (property: keyof T, oldValue: any, newValue: any) => boolean
): T {
  const forceUpdate = useForceUpdate();
  const synchronousRef = useLatest(synchronous);
  const tracker = useMemo(() => {
    const tracked = new Map<string | symbol, any>();

    return {
      tracked,
      propertyCount: signal(0),
      active: false,
      proxy: target
        ? new Proxy(target, {
            get(target, key) {
              const value = (target as any)[key];

              // Reads must not overwrite the observer's comparison baseline.
              if (!tracked.has(key)) tracked.set(key, value);

              return value;
            },
          })
        : target,
    };
  }, [target]);

  // Publish newly read properties after commit, without notifying from render.
  // The map only grows for a given target, so its size versions the key set.
  useIsomorphicLayoutEffect(() => {
    tracker.propertyCount.value = tracker.tracked.size;
  });

  useIsomorphicLayoutEffect(() => {
    if (!target) return;

    const {tracked, propertyCount} = tracker;
    tracker.active = true;
    const dispose = effect(() => {
      // Keep the effect alive, but refresh its dependencies for late reads.
      propertyCount.value;

      let stale = false;
      let sync = false;

      for (const [key, value] of tracked) {
        const latestValue = (target as any)[key];

        if (!Object.is(value, latestValue)) {
          stale = true;
          tracked.set(key, latestValue);
          sync =
            untracked(() =>
              synchronousRef.current?.(key as keyof T, value, latestValue)
            ) === true || sync;
        }
      }

      if (stale) {
        if (sync) {
          // Signal updates can originate in a React lifecycle method.
          queueMicrotask(() => {
            if (tracker.active) flushSync(forceUpdate);
          });
        } else {
          forceUpdate();
        }
      }
    });

    return () => {
      tracker.active = false;
      dispose();
    };
  }, [target, tracker, forceUpdate, synchronousRef]);

  return tracker.proxy;
}
