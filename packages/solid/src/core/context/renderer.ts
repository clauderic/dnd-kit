import {batch, createEffect, createSignal, on} from 'solid-js';

import type {DragDropManager} from '@dnd-kit/dom';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): {
  renderer: Renderer;
  trackRendering: (callback: () => void) => void;
} {
  const [transitionCount, setTransitionCount] = createSignal(0);
  let rendering: Promise<void> | null = null;
  let resolver: (() => void) | null = null;

  createEffect(
    on(transitionCount, () => {
      resolver?.();
      rendering = null;
    })
  );

  return {
    renderer: {
      get rendering() {
        return rendering ?? Promise.resolve();
      },
    },
    trackRendering(callback: () => void) {
      if (!rendering) {
        rendering = new Promise<void>((resolve) => {
          resolver = resolve;
        });
      }

      batch(() => {
        callback();
        setTransitionCount((c) => c + 1);
      });
    },
  };
}
