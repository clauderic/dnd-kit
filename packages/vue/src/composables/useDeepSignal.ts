import {effect, signal} from '@dnd-kit/state';
import type {ComputedRef, MaybeRefOrGetter} from 'vue';
import {computed, ref, toValue, watch} from 'vue';

/** Trigger a recompute when reading signal properties of an object. */
export function useDeepSignal<T extends object | null | undefined>(
  target: MaybeRefOrGetter<T>
): ComputedRef<T> {
  const dirty = ref(0);
  let version = 0;
  const tracker = computed(() => ({
    target: toValue(target),
    tracked: new Map<string | symbol, any>(),
    propertyCount: signal(0),
    active: false,
    queued: false,
  }));

  // An explicit source keeps reads inside the signal effect out of this watch.
  watch(
    tracker,
    (current, _, onCleanup) => {
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

        if (stale) dirty.value = ++version;
      });

      onCleanup(() => {
        current.active = false;
        dispose();
      });
    },
    {flush: 'post', immediate: true}
  );

  return computed(() => {
    const current = tracker.value;
    const {target, tracked} = current;
    void dirty.value;

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
  });
}
