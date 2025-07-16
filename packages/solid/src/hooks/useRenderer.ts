import { batch, createEffect, createSignal, on } from 'solid-js';

import type { DragDropManager } from '@dnd-kit/dom';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): { renderer: Renderer; trackRendering: (callback: () => void) => void } {
    const [transitionCount, setTransitionCount] = createSignal(0);
    const [rendering, setRendering] = createSignal<Promise<void> | null>(null);
    let resolve: (() => void) | null = null;

    // Resolve rendering promise when transitionCount changes
    createEffect(on(transitionCount, () => {
        resolve?.();
        setRendering(() => null);
    }));
    
    return {
        renderer: {
            get rendering() {
                return rendering() ?? Promise.resolve();
            },
        },
        trackRendering: (callback: () => void) => {
            if (!rendering()) {
                const renderPrimise = new Promise<void>((_resolve) => {
                    resolve = _resolve;
                });

                void setRendering(() => renderPrimise);
            }

            batch(() => {
                Promise.resolve(callback()).then(() => {
                    setTransitionCount(c => c + 1);
                });
            });
        }
    };
}
