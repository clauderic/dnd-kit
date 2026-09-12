import {effect, signal} from '@dnd-kit/state';
import {untrack} from 'svelte';

/** Bridge tracked properties from @dnd-kit/state to Svelte reactivity. */
export function createDeepSignal<T extends object | null | undefined>(
  getTarget: () => T
): {readonly current: T} {
  let dirty = $state(0);
  let version = 0;
  const tracker = $derived.by(() => ({
    target: getTarget(),
    tracked: new Map<string | symbol, any>(),
    propertyCount: signal(0),
    active: false,
    queued: false,
  }));

  $effect(() => {
    const current = tracker;
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

        // Never read dirty here: that would make it a dependency of $effect.
        if (stale) dirty = ++version;
      })
    );

    return () => {
      current.active = false;
      dispose();
    };
  });

  return {
    get current(): T {
      const current = tracker;
      const {target, tracked} = current;
      void dirty;

      return target
        ? new Proxy(target, {
            get(target, key) {
              const value = (target as any)[key];

              // Subsequent reads must not overwrite the observer's baseline.
              if (!tracked.has(key)) {
                tracked.set(key, value);

                if (current.active && !current.queued) {
                  current.queued = true;
                  // Do not update reactive state while evaluating the template.
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
    },
  };
}
