import type {DragDropEventHandlers, Data} from '@dnd-kit/abstract';
import type {Draggable, Droppable, DragDropManager} from '@dnd-kit/dom';
import {createEffect, onCleanup} from 'solid-js';
import type {CleanupFunction} from '@dnd-kit/state';

import {useDragDropManager} from './useDragDropManager.ts';

type EventNameOverrides = {
  beforedragstart: 'onBeforeDragStart';
};

type EventHandlerName<T extends string> = T extends keyof EventNameOverrides
  ? EventNameOverrides[T]
  : T extends `drag${infer Second}${infer Rest}`
    ? `onDrag${Uppercase<Second>}${Rest}`
    : `on${Capitalize<T>}`;

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
  [K in keyof Events<T, U, V, W> as EventHandlerName<K>]?: Events<
    T,
    U,
    V,
    W
  >[K];
};

export function useDragDropMonitor<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>(handlers: EventHandlers<T, U, V, W>): void {
  const manager = useDragDropManager();

  createEffect(() => {
    if (!manager) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'useDragDropMonitor hook was called outside of a DragDropProvider. ' +
            'Make sure your app is wrapped in a DragDropProvider component.'
        );
      }
      return;
    }

    const cleanupFns = Object.entries(handlers).reduce<CleanupFunction[]>(
      (acc, [handlerName, handler]) => {
        if (handler) {
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

    onCleanup(() => cleanupFns.forEach((cleanup) => cleanup()));
  });
}
