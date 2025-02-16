import {useEffect} from 'react';
import type {DragDropEvents, Data} from '@dnd-kit/abstract';
import type {Draggable, Droppable, DragDropManager} from '@dnd-kit/dom';

import {useDragDropManager} from './useDragDropManager.js';
import {CleanupFunction} from '@dnd-kit/state';

/**
 * Type helper to convert event names to handler names (e.g. 'dragstart' -> 'onDragStart')
 */
type EventHandlerName<T extends string> = `on${Capitalize<T>}`;

/**
 * Type for all possible event handlers
 */
type Events<T extends Data> = DragDropEvents<
  Draggable<T>,
  Droppable<T>,
  DragDropManager<Draggable<T>, Droppable<T>>
>;

export type DndMonitorEventHandlers<T extends Data> = {
  [K in keyof Events<T> as EventHandlerName<K>]?: Events<T>[K];
};

/**
 * Hook to monitor drag and drop events within a DragDropProvider
 * @param handlers Object containing event handlers for drag and drop events
 */
export function useDragDropMonitor<T extends Data = Data>(
  handlers: DndMonitorEventHandlers<T>
) {
  const manager = useDragDropManager();

  useEffect(() => {
    if (!manager) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'useDndMonitor hook was called outside of a DragDropProvider. ' +
            'Make sure your app is wrapped in a DragDropProvider component.'
        );
      }
      return;
    }

    const cleanupFns = Object.entries(handlers).reduce<CleanupFunction[]>(
      (acc, [handlerName, handler]) => {
        if (handler) {
          // Convert handler name (e.g. 'onDragStart') to event name (e.g. 'dragstart')
          const eventName = handlerName
            .replace(/^on/, '')
            .toLowerCase() as keyof Events<T>;

          const unsubscribe = manager.monitor.addEventListener(
            eventName,
            handler
          );

          acc.push(unsubscribe);
        }

        return acc;
      },
      []
    );

    return () => cleanupFns.forEach((cleanup) => cleanup?.());
  }, [manager, handlers]);
}
