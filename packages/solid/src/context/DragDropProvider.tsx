import { DragDropManager, defaultPreset } from '@dnd-kit/dom';
import { createEffect, createMemo, onCleanup } from 'solid-js';

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
        const _manager = manager();
        
        if (!_manager) {
            return;
        }

        _manager.renderer = renderer;
        _manager.plugins = props.plugins ?? defaultPreset.plugins;
        _manager.sensors = props.sensors ?? defaultPreset.sensors;
        _manager.modifiers = props.modifiers ?? defaultPreset.modifiers;
    });
    
    // Set up event listeners
    createEffect(() => {
        const disposers: (() => void)[] = [];
        const monitor = manager().monitor;
        
        disposers.push(
            monitor.addEventListener('beforedragstart', (event, manager) => {
                const callback = props.onBeforeDragStart;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            monitor.addEventListener('dragstart', (event, manager) => {
                props.onDragStart?.(event, manager);
            }),

            monitor.addEventListener('dragover', (event, manager) => {
                const callback = props.onDragOver;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            monitor.addEventListener('dragmove', (event, manager) => {
                const callback = props.onDragMove;

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            monitor.addEventListener('dragend', (event, manager) => {
                const callback = props.onDragEnd;
                console.log('dragend', event, manager, callback);

                if (callback) {
                    trackRendering(() => callback(event, manager));
                }
            }),

            monitor.addEventListener('collision', (event, manager) => {
                const callback = props.onCollision;

                if (callback) {
                    callback(event, manager);
                }
            }),
        );

        // Clean up all event listeners
        onCleanup(() => {
            disposers.forEach(cleanup => cleanup());
        });
    });

    return (
        <DragDropContext.Provider value={ manager() }>
            {props.children}
        </DragDropContext.Provider>
    );
}
