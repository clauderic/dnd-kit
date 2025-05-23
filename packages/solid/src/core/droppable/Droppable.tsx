import { createUniqueId, mergeProps, splitProps, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useDroppable, type UseDroppableInput } from './useDroppable.ts';

import type { WithAttributes } from '../../utilities/types.ts';
import type { Data } from '@dnd-kit/abstract';

type CommonProps<T extends Data = Data> = Omit<UseDroppableInput<T>, 'id'> & {
    id?: string;
} & UseDroppableInput<T>;

type DroppablePropsAsFunction<T extends Data = Data> = CommonProps<T> & {
    children: (droppable: ReturnType<typeof useDroppable>) => JSX.Element;
};

type DroppablePropsAsAttributes<T extends Data = Data> = WithAttributes<CommonProps<T>> & {
    tag?: string;
};

export type DroppableProps<T extends Data = Data> = DroppablePropsAsFunction<T> | DroppablePropsAsAttributes<T>;

export function Droppable<T extends Data = Data>(props: DroppableProps<T>) {
    const local = mergeProps({
        id: createUniqueId(),
    }, props);

    const [droppableProps, attrs] = splitProps(local, [
        'id',
        'type',
        'disabled',
        'data',
        'accept',
        'collisionPriority',
        'collisionDetector',
        'manager',
        'onBeforeDragStart',
        'onDragStart',
        'onDragMove',
        'onDragOver',
        'onCollision',
        'onDragEnd',
    ]);

    const droppableObject = useDroppable(droppableProps);

    return (
        <>
            {
                typeof props.children === 'function'
                    ? (
                        props.children(droppableObject)
                    )
                    : (
                        <Dynamic
                            component={ (props as DroppablePropsAsAttributes).tag || 'div' }
                            ref={ droppableObject.ref }
                            { ...attrs }
                        >
                            {props.children}
                        </Dynamic>
                    )
            }
        </>
    );
}
