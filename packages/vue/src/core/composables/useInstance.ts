import type {DragDropManager} from '@dnd-kit/dom';
import type {CleanupFunction} from '@dnd-kit/state';
import {computed, onWatcherCleanup, shallowRef, watchEffect} from 'vue';

import {useDragDropManager} from './useDragDropManager.ts';

export interface Instance<T extends DragDropManager = DragDropManager> {
  manager: T | undefined;
  register(): CleanupFunction | void;
}

export function useInstance<T extends Instance>(
  initializer: (manager: DragDropManager | undefined) => T
) {
  const manager = useDragDropManager() ?? undefined;
  const instance = shallowRef(initializer(manager.value));

  watchEffect(() => {
    onWatcherCleanup(instance.value.register(manager.value));
  });

  return computed(() => instance.value);
}
