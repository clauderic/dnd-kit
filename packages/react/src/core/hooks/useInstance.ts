import {useEffect, useState} from 'react';
import {Entity} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';

import {useDragDropManager} from './useDragDropManager.js';

export function useInstance<T extends Entity>(
  initializer: (manager: DragDropManager) => T
): T {
  const manager = useDragDropManager();
  const [instance] = useState<T>(() => initializer(manager));

  useEffect(() => {
    manager.registry.register(instance);

    return () => {
      manager.registry.unregister(instance);
    };
  }, []);

  return instance;
}
