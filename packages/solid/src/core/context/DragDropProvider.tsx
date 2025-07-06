import { DragDropManager, defaultPreset } from '@dnd-kit/dom';
import { createEffect, createMemo, onCleanup, splitProps, untrack } from 'solid-js';

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

export function DragDropProvider(_props: DragDropProviderProps) {
    let localManager: DragDropManager | undefined;
    
    const [props, input] = splitProps(_props, [
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
    const manager = createMemo(() => props.manager ?? new DragDropManager());

    // Destroy the manager if we created it ourselves
    onCleanup(() => {
        if (!props.manager) {
            manager().destroy();
        }
    });

    // Sync the manager with the input
    createEffect(() => {
        if (!manager()) {
            return;
        }

        manager().renderer = renderer;
        manager().plugins = input.plugins ?? defaultPreset.plugins;
        manager().sensors = input.sensors ?? defaultPreset.sensors;
        manager().modifiers = input.modifiers ?? defaultPreset.modifiers;
    });

    // Set up event listeners
    createEffect(() => {
        const disposers: (() => void)[] = [];
        
        disposers.push(
            manager().monitor.addEventListener('beforedragstart', (event, manager) => {
                const callback = props.onBeforeDragStart;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragstart', (event, manager) => {
                props.onDragStart?.(event, manager);
            }),

            manager().monitor.addEventListener('dragover', (event, manager) => {
                const callback = props.onDragOver;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragmove', (event, manager) => {
                const callback = props.onDragMove;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('dragend', (event, manager) => {
                const callback = props.onDragEnd;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            manager().monitor.addEventListener('collision', (event, manager) =>
                props.onCollision?.(event, manager))
        );

        // Clean up all event listeners
        onCleanup(() => {
            console.log('Cleaning up event listeners');
            
            disposers.forEach(cleanup => cleanup());
        });
    });

    return (
    /* eslint-disable-next-line solid/reactivity */
        <DragDropContext.Provider value={ manager() }>
            {props.children}
        </DragDropContext.Provider>
    );
}
