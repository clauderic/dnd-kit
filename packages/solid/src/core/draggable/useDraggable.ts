import { DragDropManager, Draggable, type DraggableInput } from '@dnd-kit/dom';
import { createEffect, createMemo, createSignal, splitProps } from 'solid-js';
import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { wrapSignal } from '../../utilities/index.ts';
import { useDragDropMonitor, type UseDragDropMonitorProps } from '../hooks/useDragDropMonitor.ts';

import type { Data, Droppable } from '@dnd-kit/abstract';
import { createReactiveSignal } from '../../utilities/createReactiveSignal';

export interface UseDraggableInput<T extends Data = Data> extends DraggableInput<T>, Partial<Omit<UseDragDropMonitorProps<T>, 'manager'>> {
    manager?: DragDropManager;
}

export function useDraggable<T extends Data = Data>(
    _props: UseDraggableInput<T>
) {
    const [handlers, props] = splitProps(_props, [
        'onBeforeDragStart',
        'onDragStart',
        'onDragMove',
        'onDragOver',
        'onCollision',
        'onDragEnd',
    ]);

    const [elementRef, setElementRef] = createReactiveSignal<Element | undefined>(() => props.element);
    const [handleRef, setHandleRef] = createReactiveSignal<Element | undefined>(() => props.handle);

    // Take manager from props or context or create a new one
    const managerFromContext = useDragDropManager();
    const [manager] = createReactiveSignal<DragDropManager>(() => props.manager ?? managerFromContext as DragDropManager);
    
    if (!manager()) {
        throw new Error(
            'useDraggable hook was called outside of a DragDropProvider. '
            + 'Make sure your app is wrapped in a DragDropProvider component.'
        );
    }
    
    // NOTE: We're lost reactivity here, but it's handled in the createEffect below
    const draggable = new Draggable(props, manager());

    const isDragging = wrapSignal(() => draggable.isDragging);
    const isDropping = wrapSignal(() => draggable.isDropping);
    const isDragSource = wrapSignal(() => draggable.isDragSource);

    createEffect(() => {
        draggable.manager = manager();

        if (handleRef()) {
            draggable.handle = handleRef();
        }

        if (elementRef()) {
            draggable.element = elementRef();
        }

        draggable.id = props.id;
        draggable.disabled = props.disabled ?? false;
        draggable.feedback = props.feedback ?? 'default';
        draggable.alignment = props.alignment;
        draggable.modifiers = props.modifiers;
        draggable.sensors = props.sensors;

        if (props.data) {
            draggable.data = props.data;
        }
    });

    // TODO move it to <Draggable /> and keep useDraggable hook simple
    useDragDropMonitor({
        manager,
        onBeforeDragStart: handlers.onBeforeDragStart
            ? (event, manager) => {
                if (event.operation.source === draggable) {
                    return handlers.onBeforeDragStart!(event, manager);
                }
            }
            : undefined,
        onDragStart: handlers.onDragStart
            ? (event, manager) => {
                if (event.operation.source === draggable) {
                    handlers.onDragStart!(event, manager);
                }
            }
            : undefined,
        onDragMove: handlers.onDragMove
            ? (event, manager) => {
                if (event.operation.source === draggable) {
                    return handlers.onDragMove!(event, manager);
                }
            }
            : undefined,
        onDragOver: handlers.onDragOver
            ? (event, manager) => {
                if (event.operation.source === draggable) {
                    return handlers.onDragOver!(event, manager);
                }
            }
            : undefined,
        onCollision: handlers.onCollision
            ? (event, manager) => {
                if (event.collisions.length && draggable.isDragging) {
                    return handlers.onCollision!(event, manager);
                }
            }
            : undefined,
        onDragEnd: handlers.onDragEnd
            ? (event, manager) => {
                if (event.operation.source === draggable) {
                    handlers.onDragEnd!(event, manager);
                }
            }
            : undefined,
    });

    return {
        draggable,
        isDragging,
        isDropping,
        isDragSource,
        ref: setElementRef,
        handleRef: setHandleRef,
    };
}
