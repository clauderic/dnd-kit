import { Feedback } from '@dnd-kit/dom';
import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { DragDropContext } from '../context/context.ts';
import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { useDragOperation } from '../hooks/useDragOperation.ts';

import type { DragDropManager, Draggable } from '@dnd-kit/dom';
import type { Accessor, JSX, ValidComponent } from 'solid-js';

function noop() {
    return () => {};
}

export interface DragOverlayProps {
    class?: string;
    children: JSX.Element | ((source: Draggable) => JSX.Element);
    style?: JSX.CSSProperties;
    tag?: ValidComponent;
}

export function DragOverlay(props: DragOverlayProps) {
    const [element, setElement] = createSignal<HTMLDivElement>();
    const manager = useDragDropManager();
    const patchedManager = usePatchedManager(manager);
    const dragOperation = useDragOperation();

    createEffect(() => {
        if (!dragOperation.source) {
            setElement(undefined);
        }
    });

    createEffect(() => {
        const feedback = manager?.plugins.find(
            (plugin): plugin is Feedback => plugin instanceof Feedback
        );

        if (!feedback) {
            return;
        }

        feedback.overlay = element();

        onCleanup(() => {
            feedback.overlay = undefined;
        });
    });

    return (
        <DragDropContext.Provider value={ patchedManager() }>
            <Show when={ dragOperation.source }>
                { (source: Accessor<Draggable>) => (
                    <Dynamic
                        component={ props.tag || 'div' }
                        class={ props.class }
                        style={ props.style }
                        data-dnd-overlay
                        ref={ setElement }
                    >
                        {
                            typeof props.children === 'function'
                                ? props.children(source())
                                : props.children
                        }
                    </Dynamic>
                ) }
            </Show>
        </DragDropContext.Provider>
    );
}

/**
 * Creates a patched version of the drag-drop manager that prevents
 * draggable/droppable registration within the overlay.
 * This ensures that elements inside the overlay don't interfere with
 * the main drag-drop context.
 */
function usePatchedManager(manager: DragDropManager | null) {
    const patchedManager = createMemo(() => {
        if (!manager) {
            return null;
        }

        // Create a proxy for the registry that prevents registration/unregistration
        const patchedRegistry = new Proxy(manager.registry, {
            get(target, property) {
                if (property === 'register' || property === 'unregister') {
                    return noop;
                }

                return target[property as keyof typeof target];
            },
        });

        // Create a proxy for the manager that uses our patched registry
        return new Proxy(manager, {
            get(target, property) {
                if (property === 'registry') {
                    return patchedRegistry;
                }

                return target[property as keyof typeof target];
            },
        });
    });

    return patchedManager;
}
