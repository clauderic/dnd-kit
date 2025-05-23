import { DragDropManager, Droppable, type DroppableInput } from '@dnd-kit/dom';
import { createEffect, createMemo, createSignal, splitProps } from 'solid-js';

import { useDragDropMonitor, type UseDragDropMonitorProps } from '../hooks/useDragDropMonitor.ts';
import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { wrapSignal } from '../../utilities/index.ts';

import type { Data } from '@dnd-kit/abstract';

export interface UseDroppableInput<T extends Data = Data> extends DroppableInput<T>, Partial<UseDragDropMonitorProps<T>> {
    manager?: DragDropManager;
}

export function useDroppable<T extends Data = Data>(
    props: UseDroppableInput<T>
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

    const manager = createMemo(() => input.manager ?? useDragDropManager() ?? new DragDropManager());

    const droppable = new Droppable({
        ...input,
    }, manager());

    const isDropTarget = wrapSignal(() => droppable.isDropTarget);

    createEffect(() => {
        if (elementRef()) {
            droppable.element = elementRef();
        }

        droppable.manager = manager();
        droppable.id = input.id;
        droppable.disabled = input.disabled ?? false;
        droppable.accept = input.accept;
        droppable.type = input.type;

        droppable.collisionPriority = input.collisionPriority;

        if (input.collisionDetector) {
            droppable.collisionDetector = input.collisionDetector;
        }

        if (input.data) {
            droppable.data = input.data;
        }
    });

    createEffect(() => {
        useDragDropMonitor({
            manager: manager(),
            onBeforeDragStart: handlers.onBeforeDragStart
                ? (event, manager) => {
                    if (event.operation.target === droppable) {
                        return handlers.onBeforeDragStart!(event, manager);
                    }
                }
                : undefined,
            onDragStart: handlers.onDragStart
                ? (event, manager) => {
                    if (event.operation.target === droppable) {
                        handlers.onDragStart!(event, manager);
                    }
                }
                : undefined,
            onDragMove: handlers.onDragMove
                ? (event, manager) => {
                    if (event.operation.target === droppable) {
                        return handlers.onDragMove!(event, manager);
                    }
                }
                : undefined,
            onDragOver: handlers.onDragOver
                ? (event, manager) => {
                    if (event.operation.target === droppable) {
                        return handlers.onDragOver!(event, manager);
                    }
                }
                : undefined,
            onCollision: handlers.onCollision
                ? (event, manager) => {
                    if (event.collisions.length && droppable.isDropTarget) {
                        return handlers.onCollision!(event, manager);
                    }
                }
                : undefined,
            onDragEnd: handlers.onDragEnd
                ? (event, manager) => {
                    if (event.operation.target === droppable) {
                        handlers.onDragEnd!(event, manager);
                    }
                }
                : undefined,
        });
    });

    return {
        droppable,
        isDropTarget,
        ref: setElementRef,
    };
}
