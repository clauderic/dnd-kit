import {useEffect} from 'react';
import {Entity} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {useConstant} from '@dnd-kit/react/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useInstance<T extends Entity>(
  initializer: (manager: DragDropManager) => T
): T {
  const manager = useDragDropManager();
  const instance = useConstant<T>(() => initializer(manager));

  useEffect(() => {
    instance.manager = manager as any;

    // Register returns an unregister callback
    return manager.registry.register(instance);
  }, [manager]);

  return instance;
}
