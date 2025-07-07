import { Feedback } from '@dnd-kit/dom';
import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { DragDropContext } from '../context/context.ts';
import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { useDragOperation } from '../hooks/useDragOperation.ts';

import type { DragDropManager, Draggable, Droppable } from '@dnd-kit/dom';
import type { Accessor, JSX, ValidComponent } from 'solid-js';
import type { Data } from '@dnd-kit/abstract';

export interface DragOverlayProps<T extends Data, U extends Draggable<T>> {
    manager?: DragDropManager<T, U, Droppable<T>>;
    class?: string;
    children: JSX.Element | ((source: U) => JSX.Element);
    style?: JSX.CSSProperties;
    tag?: ValidComponent;
    disabled?: boolean | ((source: U | null) => boolean);
}

export function DragOverlay<T extends Data, U extends Draggable<T>>(props: DragOverlayProps<T, U>) {
    const [element, setElement] = createSignal<HTMLDivElement>();
    // TODO fix potential reactivity issues
    const contextManager = useDragDropManager<T, U>();
    const manager = (() => props.manager ?? contextManager) as Accessor<DragDropManager<Data, Draggable<Data>, Droppable<Data>> | null>;
    const patchedManager = usePatchedManager(manager);
    const dragOperation = useDragOperation<T, U>();
    
    const source = () => dragOperation.source as U | null;
    
    const isDisabled = () => {
        if (typeof props.disabled === 'function') {
            return props.disabled((dragOperation.source as U | null));
        }
        
        if (typeof props.disabled === 'boolean') {
            return props.disabled;
        }
        
        return false;
    };
    
    createEffect(() => {        
        if (!source()) {
            setElement(undefined);
        }
    });

    createEffect(() => {
        const _manager = manager();
        
        if (!_manager || isDisabled()) return;

        const feedback = _manager.plugins.find(
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
            <Show when={ source() && !isDisabled() }>
                { (src) => {
                    return (
                        <Dynamic
                            component={ props.tag || 'div' }
                            class={ props.class }
                            style={ props.style }
                            data-dnd-overlay
                            ref={ setElement }
                        >
                            {
                                typeof props.children === 'function'
                                    ? props.children(src as any)
                                    : props.children
                            }
                        </Dynamic>
                    );
                } }
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
function usePatchedManager<T extends Data, U extends Draggable<T>, V extends Droppable<T>, W extends DragDropManager<T, U, V>>(manager: Accessor<W | null>) {
    const patchedManager = createMemo(() => {
        const _manager = manager();

        if (!_manager) {
            return null;
        }

        // Create a proxy for the registry that prevents registration/unregistration
        const patchedRegistry = new Proxy(_manager.registry, {
            get(target, property) {
                if (property === 'register' || property === 'unregister') {
                    return noop;
                }

                return target[property as keyof typeof target];
            },
        });

        // Create a proxy for the manager that uses our patched registry
        return new Proxy(_manager, {
            get(target, property) {
                if (property === 'registry') {
                    return patchedRegistry;
                }

                return target[property as keyof typeof target];
            },
        });
    });

    return patchedManager as Accessor<W | null>;
}

function noop() {
    return () => {};
}
