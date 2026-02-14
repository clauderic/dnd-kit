import type {DragDropManager} from '@dnd-kit/dom';
import type {CleanupFunction} from '@dnd-kit/state';

import {getDragDropManager} from './getDragDropManager.js';

export interface Instance<T extends DragDropManager = DragDropManager> {
  manager: T | undefined;
  register(): CleanupFunction | void;
}

export function createInstance<T extends Instance>(
  initializer: (manager: DragDropManager | undefined) => T
): T {
  const manager = getDragDropManager();
  const instance = initializer(manager);

  $effect(() => {
    instance.manager = manager;
    const cleanup = instance.register();

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  });

  return instance;
}
