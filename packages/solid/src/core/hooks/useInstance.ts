import type {DragDropManager} from '@dnd-kit/dom';
import type {CleanupFunction} from '@dnd-kit/state';
import {createEffect, onCleanup} from 'solid-js';

import {useDragDropManager} from './useDragDropManager.ts';

export interface Instance<T extends DragDropManager = DragDropManager> {
  manager: T | undefined;
  register(): CleanupFunction | void;
}

export function useInstance<T extends Instance>(
  initializer: (manager: DragDropManager | undefined) => T
): T {
  const manager = useDragDropManager() ?? undefined;
  const instance = initializer(manager);

  createEffect(() => {
    instance.manager = manager;
    const cleanup = instance.register();

    onCleanup(() => cleanup?.());
  });

  return instance;
}
