import type {DragDropManager} from '@dnd-kit/dom';
import type {CleanupFunction} from '@dnd-kit/state';
import {createEffect} from 'solid-js';

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

  createEffect(
    () => manager,
    (manager) => {
      instance.manager = manager;
      const cleanup = instance.register();

      return () => cleanup?.();
    }
  );

  return instance;
}
