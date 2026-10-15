import {effect, signal, untracked} from '@dnd-kit/state';
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
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

  createEffect(() => {
    const current = tracker();
    const {target, tracked, propertyCount} = current;
    if (!target) return;

    current.active = true;
    const dispose = effect(() =>
      untrack(() => {
        propertyCount.value;
        let stale = false;

        for (const [key, value] of tracked) {
          const latestValue = (target as any)[key];

          if (!Object.is(value, latestValue)) {
            stale = true;
            tracked.set(key, latestValue);
          }
        }

        // Solid may render immediately; keep those reads out of this effect.
        if (stale) untracked(() => setDirty((value) => value + 1));
      })
    );

    onCleanup(() => {
      current.active = false;
      dispose();
    });
  });

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
