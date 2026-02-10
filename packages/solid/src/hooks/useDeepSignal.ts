import {effect, untracked} from '@dnd-kit/state';
import {createEffect, createSignal, onCleanup, type Accessor} from 'solid-js';

/** Trigger a re-render when reading signal properties of an object. */
export function useDeepSignal<T extends object | null | undefined>(
  target: Accessor<T>
): Accessor<T> {
  const tracked = new Map<string | symbol, any>();
  const [dirty, setDirty] = createSignal(0);

  // Create the preact effect AFTER the first render,
  // when tracked has been populated by Proxy getters.
  createEffect(() => {
    const _target = target();
    if (!_target) {
      tracked.clear();
      return;
    }

    const dispose = effect(() => {
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
        setDirty((v) => v + 1);
      }
    });

    onCleanup(dispose);
  });

  return () => {
    const _target = target();

    void dirty();

    return _target
      ? new Proxy(_target, {
          get(target, key) {
            const value = (target as any)[key];
            tracked.set(key, value);
            return value;
          },
        })
      : _target;
  };
}
