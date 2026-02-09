import type {DragDropManager} from '@dnd-kit/dom';
import {nextTick, ref, watch} from 'vue';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): {
  renderer: Renderer;
  trackRendering: (callback: () => void) => void;
} {
  const transitionCount = ref(0);
  const rendering = ref<Promise<void> | null>(null);
  let resolver: (() => void) | null = null;

  watch(
    transitionCount,
    () => {
      resolver?.();
      rendering.value = null;
    },
    {
      flush: 'post',
    }
  );

  const renderer: Renderer = {
    get rendering() {
      return rendering.value ?? Promise.resolve();
    },
  };

  function trackRendering(callback: () => void) {
    if (!rendering.value) {
      rendering.value = new Promise<void>((resolve) => {
        resolver = resolve;
      });
    }

    callback();

    nextTick(() => {
      transitionCount.value++;
    });
  }

  return {
    renderer,
    trackRendering,
  };
}
