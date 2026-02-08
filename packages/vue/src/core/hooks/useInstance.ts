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
  const manager = useDragDropManager();
  const instance = shallowRef(initializer(manager.value));

  watchEffect(() => {
    instance.value.manager = manager.value;
    onWatcherCleanup(instance.value.register());
  });

  return computed(() => instance.value);
}
