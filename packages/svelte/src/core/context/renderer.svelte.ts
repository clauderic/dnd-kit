import type {DragDropManager} from '@dnd-kit/dom';
import {tick} from 'svelte';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): {
  renderer: Renderer;
  trackRendering: (callback: () => void) => void;
} {
  let transitionCount = $state(0);
  let rendering: Promise<void> | null = null;
  let resolver: (() => void) | null = null;

  $effect(() => {
    // Track transitionCount so this effect re-runs after DOM updates
    void transitionCount;
    resolver?.();
    rendering = null;
  });

  const renderer: Renderer = {
    get rendering() {
      return rendering ?? Promise.resolve();
    },
  };

  function trackRendering(callback: () => void) {
    if (!rendering) {
      rendering = new Promise<void>((resolve) => {
        resolver = resolve;
      });
    }

    callback();

    tick().then(() => {
      transitionCount++;
    });
  }

  return {
    renderer,
    trackRendering,
  };
}
