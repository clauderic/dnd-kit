import { DragDropManager } from '@dnd-kit/dom';
import { createEffect, createMemo, onCleanup, splitProps } from 'solid-js';

import { DragDropContext } from './context.ts';
import { useRenderer } from '../hooks/useRenderer.ts';

import type { DragDropEvents } from '@dnd-kit/abstract';
import type { DragDropManagerInput, Draggable, Droppable } from '@dnd-kit/dom';
import type { ParentProps } from 'solid-js';

export type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface DragDropProviderProps extends DragDropManagerInput, ParentProps {
    manager?: DragDropManager;
    onBeforeDragStart?: Events['beforedragstart'];
    onCollision?: Events['collision'];
    onDragStart?: Events['dragstart'];
    onDragMove?: Events['dragmove'];
    onDragOver?: Events['dragover'];
    onDragEnd?: Events['dragend'];
}

export function DragDropProvider(props: DragDropProviderProps) {
    const [local, input] = splitProps(props, [
        'children',
        'manager',
        'onCollision',
        'onBeforeDragStart',
        'onDragStart',
        'onDragMove',
        'onDragOver',
        'onDragEnd',
    ]);

    const { renderer, trackRendering } = useRenderer();
    const manager = createMemo(() => local.manager ?? new DragDropManager(input));

    // Destroy the manager if we created it ourselves
    onCleanup(() => {
        if (!local.manager) {
            manager().destroy();
        }
    });

    // Sync the manager with the input
    createEffect(() => {
        if (!manager()) {
            return;
        }

        manager().renderer = renderer;

        if (input.plugins) {
            manager().plugins = input.plugins;
        }

        if (input.sensors) {
            manager().sensors = input.sensors;
        }

        if (input.modifiers) {
            manager().modifiers = input.modifiers;
        }
    });

    // Set up event listeners
    createEffect(() => {
        const disposers: (() => void)[] = [];

        disposers.push(
            manager().monitor.addEventListener('beforedragstart', (event, manager) => {
                const callback = local.onBeforeDragStart;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragstart', (event, manager) => {
                local.onDragStart?.(event, manager);
            }),

            manager().monitor.addEventListener('dragover', (event, manager) => {
                const callback = local.onDragOver;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragmove', (event, manager) => {
                const callback = local.onDragMove;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragend', (event, manager) => {
                const callback = local.onDragEnd;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('collision', (event, manager) =>
                local.onCollision?.(event, manager))
        );

        // Clean up all event listeners
        onCleanup(() => {
            disposers.forEach(cleanup => cleanup());
        });
    });

    return (
    /* eslint-disable-next-line solid/reactivity */
        <DragDropContext.Provider value={ manager() }>
            {local.children}
        </DragDropContext.Provider>
    );
}
