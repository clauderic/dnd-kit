import { createEffect, createMemo, onCleanup, splitProps } from 'solid-js';

import { useDragDropManager } from '../hooks/useDragDropManager.ts';

import type { Data, DragDropEvents } from '@dnd-kit/abstract';
import type { DragDropManager, Draggable, Droppable } from '@dnd-kit/dom';
import type { CleanupFunction } from '@dnd-kit/state';

/**
 * Type for all possible event handlers
 */
export type Events<T extends Data> = DragDropEvents<
    Draggable<T>,
    Droppable<T>,
    DragDropManager<Draggable<T>, Droppable<T>>
>;

export interface UseDragDropMonitorProps<T extends Data = Data> {
    manager?: DragDropManager<Draggable<T>, Droppable<T>>;

    onBeforeDragStart?: Events<T>['beforedragstart'];
    onCollision?: Events<T>['collision'];
    onDragStart?: Events<T>['dragstart'];
    onDragMove?: Events<T>['dragmove'];
    onDragOver?: Events<T>['dragover'];
    onDragEnd?: Events<T>['dragend'];
}

/**
 * Hook to monitor drag and drop events anywhere within a DragDropProvider
 * @param handlers Object containing event handlers for drag and drop events
 * @returns A disposer function that can be called to cleanup event listeners
 */
export function useDragDropMonitor<T extends Data = Data>(
    props: UseDragDropMonitorProps<T>
): () => void {
    const [local, handlers] = splitProps(props, ['manager']);
    const manager = createMemo(() => local.manager ?? useDragDropManager());

    if (!manager()) {
        console.warn(
            'useDndMonitor hook was called outside of a DragDropProvider. '
            + 'Make sure your app is wrapped in a DragDropProvider component.'
        );

        return () => {};
    }

    let cleanupFns: CleanupFunction[] = [];

    const disposer = () => {
        cleanupFns.forEach(cleanup => cleanup?.());
        cleanupFns = [];
    };

    createEffect(() => {
        const monitor = manager()?.monitor;

        if (!monitor) {
            return;
        }

        cleanupFns = Object.entries(handlers).reduce<CleanupFunction[]>(
            (acc, [handlerName, handler]) => {
                if (handler) {
                    // Convert handler name (e.g. 'onDragStart') to event name (e.g. 'dragstart')
                    const eventName = handlerName
                        .replace(/^on/, '')
                        .toLowerCase() as keyof Events<T>;

                    acc.push(
                        monitor.addEventListener(
                            eventName,
                            handler
                        )
                    );
                }

                return acc;
            },
            []
        );

        onCleanup(disposer);
    });

    return disposer;
}
