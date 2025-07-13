import { DragDropManager } from '@dnd-kit/dom';
import { Sortable, type SortableInput } from '@dnd-kit/dom/sortable';
import { createEffect } from 'solid-js';

import type { Data } from '@dnd-kit/abstract';
import { createReactiveSignal } from '../utilities';
import { useDragDropManager } from '../hooks/useDragDropManager';

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
    props: UseSortableInput<T>
) {
    const [elementRef, setElementRef] = createReactiveSignal<Element | undefined>(() => props.element);
    const [handleRef, setHandleRef] = createReactiveSignal<Element | undefined>(() => props.handle);
    const [targetRef, setTargetRef] = createReactiveSignal<Element | undefined>(() => props.target);
    const [sourceRef, setSourceRef] = createReactiveSignal<Element | undefined>(() => props.source);

    // Take manager from props or context or create a new one
    const managerFromContext = useDragDropManager();
    const [manager] = createReactiveSignal<DragDropManager>(() => props.manager ?? managerFromContext as DragDropManager);
    
    // NOTE: We're lost reactivity here, but it's handled in the createEffect below
    const sortable = new Sortable({
        transition: DEFAULT_TRANSITION,
        ...props,
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

        sortable.id = props.id;
        sortable.disabled = props.disabled ?? false;
        sortable.feedback = props.feedback ?? 'default';
        sortable.alignment = props.alignment;
        sortable.modifiers = props.modifiers;
        sortable.sensors = props.sensors;
        sortable.accept = props.accept;
        sortable.type = props.type;
        sortable.group = props.group;
        sortable.index = props.index;
        sortable.collisionPriority = props.collisionPriority;
        sortable.transition = props.transition ?? DEFAULT_TRANSITION;

        if (props.collisionDetector) {
            sortable.collisionDetector = props.collisionDetector;
        }

        if (props.data) {
            sortable.data = props.data;
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
