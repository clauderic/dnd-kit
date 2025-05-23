import { children, createEffect } from 'solid-js';

import type { JSX } from 'solid-js';

// Allows to get refs of children components, even if they lazy or not forwarded ref
export const ForwardRef = (props: { children: JSX.Element; ref: (value: JSX.Element[]) => void }) => {
    const kids = children(() => props.children);

    createEffect(() => {
        props.ref?.(kids.toArray().filter(e => e != null));
    });

    return (<>{ kids() }</>);
};
