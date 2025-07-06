import { DragDropManager } from '@dnd-kit/dom';
import { Sortable, type SortableInput } from '@dnd-kit/dom/sortable';
import { createEffect, createSignal, type Accessor, type Signal } from 'solid-js';

import { useDragDropManager } from '../core/hooks/useDragDropManager.ts';

import type { Data } from '@dnd-kit/abstract';
import { createReactiveSignal } from '../utilities/createReactiveSignal';

export interface UseSortableInput<T extends Data = Data> extends Omit<SortableInput<T>, 'source'> {
    manager?: DragDropManager;
    source?: Element;
}

const DEFAULT_TRANSITION = {
    duration: 250, // Animation duration in ms
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Animation easing
    idle: false, // Whether to animate when no drag is in progress
};


export function useSortable<T extends Data = Data>(
    input: UseSortableInput<T>
) {
    const [elementRef, setElementRef] = createReactiveSignal<Element | undefined>(() => input.element);
    const [handleRef, setHandleRef] = createReactiveSignal<Element | undefined>(() => input.handle);
    const [targetRef, setTargetRef] = createReactiveSignal<Element | undefined>(() => input.target);
    const [sourceRef, setSourceRef] = createReactiveSignal<Element | undefined>(() => input.source);

    // Take manager from props or context or create a new one
    const managerFromContext = useDragDropManager();
    const [manager, setManager] = createReactiveSignal(() => input.manager ?? managerFromContext ?? new DragDropManager());
    
    // NOTE: We're lost reactivity here, it handled in the createEffect below
    const sortable = new Sortable({
        ...input,
        transition: input.transition ?? DEFAULT_TRANSITION,
    }, manager());
    
    createEffect(() => {
        if (handleRef()) {
            sortable.handle = handleRef();
        }

        if (elementRef()) {
            sortable.element = elementRef();
        }

        if (targetRef()) {
            sortable.target = targetRef();
        }

        if (sourceRef()) {
            sortable.source = sourceRef();
        }
        
        sortable.manager = manager();

        sortable.id = input.id;
        sortable.disabled = input.disabled ?? false;
        sortable.feedback = input.feedback ?? 'default';
        sortable.alignment = input.alignment;
        sortable.modifiers = input.modifiers;
        sortable.sensors = input.sensors;
        sortable.accept = input.accept;
        sortable.type = input.type;
        sortable.group = input.group;
        sortable.index = input.index;
        sortable.collisionPriority = input.collisionPriority;
        sortable.transition = input.transition ?? DEFAULT_TRANSITION;

        if (input.collisionDetector) {
            sortable.collisionDetector = input.collisionDetector;
        }

        if (input.data) {
            sortable.data = input.data;
        }
    });

    return {
        sortable,
        isDragging: () => sortable.isDragging,
        isDropping: () => sortable.isDropping,
        isDragSource: () => sortable.isDragSource,
        isDropTarget: () => sortable.isDropTarget,

        ref: setElementRef,
        targetRef: setTargetRef,
        sourceRef: setSourceRef,
        handleRef: setHandleRef,
    };
}
