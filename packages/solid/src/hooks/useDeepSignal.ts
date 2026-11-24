import {effect, signal} from '@dnd-kit/state';
import {
  createEffect,
  createMemo,
  createSignal,
  type Accessor,
} from 'solid-js';

/** Trigger a re-render when reading signal properties of an object. */
export function useDeepSignal<T extends object | null | undefined>(
  target: Accessor<T>
): Accessor<T> {
  const [dirty, setDirty] = createSignal(0);
  const tracker = createMemo(() => ({
    target: target(),
    tracked: new Map<string | symbol, any>(),
    propertyCount: signal(0),
    active: false,
    queued: false,
  }));

  createEffect(
    () => tracker(),
    (current) => {
      const {target, tracked, propertyCount} = current;
      if (!target) return;

      current.active = true;
      const dispose = effect(() => {
        propertyCount.value;
        let stale = false;

        for (const [key, value] of tracked) {
          const latestValue = (target as any)[key];

          if (!Object.is(value, latestValue)) {
            stale = true;
            tracked.set(key, latestValue);
          }
        }

        if (stale) setDirty((value) => value + 1);
      });

      return () => {
        current.active = false;
        dispose();
      };
    }
  );

  return () => {
    const current = tracker();
    const {target, tracked} = current;
    void dirty();

    return target
      ? new Proxy(target, {
          get(target, key) {
            const value = (target as any)[key];

            // Subsequent reads must not overwrite the observer's baseline.
            if (!tracked.has(key)) {
              tracked.set(key, value);

              if (current.active && !current.queued) {
                current.queued = true;
                // Refresh dependencies after the current render has finished.
                queueMicrotask(() => {
                  current.queued = false;
                  if (current.active)
                    current.propertyCount.value = tracked.size;
                });
              }
            }

            return value;
          },
        })
      : target;
  };
}
