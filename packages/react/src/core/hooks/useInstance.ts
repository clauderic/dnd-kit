import {useEffect, useState} from 'react';
import type {DragDropManager, Entity} from '@dnd-kit/abstract';

import {useDragDropManager} from './useDragDropManager.ts';

export function useInstance<T extends Entity>(initializer: () => T): T {
  const manager = useDragDropManager() ?? undefined;
  const [instance] = useState<T>(() => initializer());

  useEffect(() => {
    instance.manager = manager as DragDropManager | undefined;

    // Register returns an unregister callback
    return manager?.registry.register(instance);
  }, [instance, manager]);

  return instance;
}
