import {effect, untracked} from '@dnd-kit/state';

/**
 * Bridge between @dnd-kit/state (Preact signals) and Svelte 5 reactivity.
 *
 * Uses a hybrid push-pull strategy:
 * - Pull: A Proxy tracks which properties the template actually reads
 * - Push: A single @dnd-kit/state effect watches only tracked properties
 *   and bumps a single $state dirty counter when any change
 * - Read: Getters read `dirty` (so Svelte subscribes) then return
 *   the current value from the instance
 */
export function createDeepSignal<T extends object | null | undefined>(
  getTarget: () => T
): {readonly current: T} {
  const tracked = new Map<string | symbol, any>();
  let dirty = $state(0);

  $effect(() => {
    const target = getTarget();

    if (!target) {
      tracked.clear();
      return;
    }

    const dispose = effect(() => {
      let stale = false;

      for (const entry of tracked) {
        const [key] = entry;
        const value = untracked(() => entry[1]);
        const latestValue = (target as any)[key];

        if (value !== latestValue) {
          stale = true;
          tracked.set(key, latestValue);
        }
      }

      if (stale) {
        dirty++;
      }
    });

    return dispose;
  });

  return {
    get current(): T {
      const target = getTarget();

      // Reading dirty subscribes the Svelte template/effect to changes
      void dirty;

      return target
        ? (new Proxy(target as object, {
            get(obj, key) {
              const value = (obj as any)[key];
              tracked.set(key, value);
              return value;
            },
          }) as T)
        : target;
    },
  };
}
