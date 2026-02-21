import {useEffect} from 'react';
import type {DragDropEventHandlers, Data} from '@dnd-kit/abstract';
import type {Draggable, Droppable, DragDropManager} from '@dnd-kit/dom';

import {useDragDropManager} from './useDragDropManager.js';
import {CleanupFunction} from '@dnd-kit/state';

type EventNameOverrides = {
  beforedragstart: 'onBeforeDragStart';
};

type EventHandlerName<T extends string> = T extends keyof EventNameOverrides
  ? EventNameOverrides[T]
  : T extends `drag${infer Second}${infer Rest}`
    ? `onDrag${Uppercase<Second>}${Rest}`
    : `on${Capitalize<T>}`;

/**
 * Type for all possible event handlers
 */
type Events<
  T extends Data,
  U extends Draggable<T>,
  V extends Droppable<T>,
  W extends DragDropManager<T, U, V>,
> = DragDropEventHandlers<U, V, W>;

export type EventHandlers<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
> = {
  [K in keyof Events<T, U, V, W> as EventHandlerName<K>]: Events<T, U, V, W>[K];
};

/**
 * Hook to monitor drag and drop events anywhere within a DragDropProvider
 * @param handlers Object containing event handlers for drag and drop events
 */
export function useDragDropMonitor<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>(handlers: Partial<EventHandlers<T, U, V, W>>): void {
  const manager = useDragDropManager<T, U, V, W>();

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
            .toLowerCase() as keyof Events<T, U, V, W>;

          const unsubscribe = manager.monitor.addEventListener(
            eventName,
            handler as any
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
