import {useEffect, useState} from 'react';
import {Entity} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

import {useDragDropManager} from './useDragDropManager.ts';

export function useInstance<T extends Entity>(
  initializer: (manager: DragDropManager | undefined) => T
): T {
  const manager = useDragDropManager() ?? undefined;
  const [instance] = useState<T>(() => initializer(manager));

  useEffect(() => {
    instance.manager = manager as any;

    // Register returns an unregister callback
    return manager?.registry.register(instance);
  }, [instance, manager]);

  return instance;
}
