import { DragDropManager, Draggable, type DraggableInput } from '@dnd-kit/dom';
import { createEffect, createMemo, createSignal, splitProps } from 'solid-js';
import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { wrapSignal } from '../../utilities/index.ts';
import { useDragDropMonitor, type UseDragDropMonitorProps } from '../hooks/useDragDropMonitor.ts';

import type { Data } from '@dnd-kit/abstract';

export interface UseDraggableInput<T extends Data = Data> extends DraggableInput<T>, Partial<UseDragDropMonitorProps<T>> {
    manager?: DragDropManager;
}

export function useDraggable<T extends Data = Data>(
    props: UseDraggableInput<T>
) {
    const [handlers, input] = splitProps(props, [
        'onBeforeDragStart',
        'onDragStart',
        'onDragMove',
        'onDragOver',
        'onCollision',
        'onDragEnd',
    ]);

    const [elementRef, setElementRef] = createSignal<Element | undefined>(input.element);
    const [handleRef, setHandleRef] = createSignal<Element | undefined>(input.handle);

    const manager = createMemo(() => input.manager ?? useDragDropManager() ?? new DragDropManager());
    const draggable = new Draggable(input, manager());

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

        draggable.id = input.id;
        draggable.disabled = input.disabled ?? false;
        draggable.feedback = input.feedback ?? 'default';
        draggable.alignment = input.alignment;
        draggable.modifiers = input.modifiers;
        draggable.sensors = input.sensors;

        if (input.data) {
            draggable.data = input.data;
        }
    });

    createEffect(() => {
        useDragDropMonitor({
            manager: manager(),
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
