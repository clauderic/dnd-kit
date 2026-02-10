import {effect, untracked} from '@dnd-kit/state';
import type {ComputedRef, MaybeRefOrGetter} from 'vue';
import {computed, onWatcherCleanup, ref, toValue, watchEffect} from 'vue';

/** Trigger a recompute when reading signal properties of an object. */
export function useDeepSignal<T extends object | null | undefined>(
  target: MaybeRefOrGetter<T>
): ComputedRef<T> {
  const tracked = new Map<string | symbol, any>();
  const dirty = ref(0);

  watchEffect(() => {
    const _target = toValue(target);
    if (!_target) {
      tracked.clear();
      return;
    }

    onWatcherCleanup(
      effect(() => {
        let stale = false;

        for (const entry of tracked) {
          const [key] = entry;
          const value = untracked(() => entry[1]);
          const latestValue = (_target as any)[key];

          if (value !== latestValue) {
            stale = true;
            tracked.set(key, latestValue);
          }
        }

        if (stale) {
          dirty.value++;
        }
      })
    );
  }, {flush: 'post'});

  return computed(() => {
    const _target = toValue(target);

    void dirty.value;

    return _target
      ? new Proxy(_target, {
          get(target, key) {
            const value = (target as any)[key];

            tracked.set(key, value);

            return value;
          },
        })
      : _target;
  });
}
