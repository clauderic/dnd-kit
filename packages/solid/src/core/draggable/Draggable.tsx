import { createUniqueId, mergeProps, splitProps, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useDraggable, type UseDraggableInput } from './useDraggable.ts';

import type { WithAttributes } from '../../utilities/types.ts';
import type { Data } from '@dnd-kit/abstract';

type CommonProps<T extends Data = Data> = Omit<UseDraggableInput<T>, 'id'> & {
    id?: string;
} & UseDraggableInput<T>;

type DraggablePropsAsFunction<T extends Data = Data> = CommonProps<T> & {
    children: (draggable: ReturnType<typeof useDraggable>) => JSX.Element;
};

type DraggablePropsAsAttributes<T extends Data = Data> = WithAttributes<CommonProps<T>> & {
    tag?: string;
};

export type DraggableProps<T extends Data = Data> = DraggablePropsAsFunction<T> | DraggablePropsAsAttributes<T>;

export function Draggable<T extends Data = Data>(props: DraggableProps<T>) {
    const local = mergeProps({
        id: createUniqueId(),
    }, props);

    const [draggableProps, attrs] = splitProps(local, [
        'id',
        'type',
        'disabled',
        'data',
        'handle',
        'feedback',
        'alignment',
        'modifiers',
        'sensors',
        'manager',
        'onBeforeDragStart',
        'onDragStart',
        'onDragMove',
        'onDragOver',
        'onCollision',
        'onDragEnd',
    ]);

    const draggableObject = useDraggable(draggableProps);

    return (
        <>
            {
                typeof props.children === 'function'
                    ? (
                        props.children(draggableObject)
                    )
                    : (
                        <Dynamic
                            component={ (props as DraggablePropsAsAttributes).tag || 'div' }
                            ref={ draggableObject.ref }
                            { ...attrs }
                        >
                            {props.children}
                        </Dynamic>
                    )
            }
        </>
    );
}
