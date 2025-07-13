import { batch, createEffect, createSignal, on } from 'solid-js';

import type { DragDropManager } from '@dnd-kit/dom';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): { renderer: Renderer; trackRendering: (callback: () => void) => void } {
    const [transitionCount, setTransitionCount] = createSignal(0);
    const [rendering, setRendering] = createSignal<Promise<void> | null>(null);
    let resolver: (() => void) | null = null;

    // Resolve rendering promise when transitionCount changes
    createEffect(on(transitionCount, () => {
        resolver?.();
        setRendering(() => null);
    }));

    const renderer = {
        get rendering() {
            return rendering() ?? Promise.resolve();
        },
    };

    function trackRendering(callback: () => void) {
        if (!rendering()) {
            const newRendering = new Promise<void>((resolve) => {
                resolver = resolve;
            });

            void setRendering(async() => newRendering);
        }

        batch(() => {
            callback();
            setTransitionCount(c => c + 1);
        });
    }

    return {
        renderer,
        trackRendering,
    };
}
