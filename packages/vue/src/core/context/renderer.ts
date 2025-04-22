import type {DragDropManager} from '@dnd-kit/dom';
import {nextTick, ref, watch} from 'vue';

type Renderer = DragDropManager['renderer'];

export function useRenderer(): {
  renderer: Renderer;
  trackRendering: (callback: () => void) => void;
} {
  const transitionCount = ref(0);
  const rendering = ref<Promise<void>>(Promise.resolve());
  let resolver: (() => void) | null = null;

  watch(
    transitionCount,
    () => {
      resolver?.();
      rendering.value = Promise.resolve();
    },
    {
      flush: 'post',
    }
  );

  const renderer = {
    get rendering() {
      return rendering.value;
    },
  };

  function trackRendering(callback: () => void) {
    if (rendering.value === Promise.resolve()) {
      rendering.value = new Promise<void>((resolve) => {
        resolver = resolve;
      });
    }

    nextTick(() => {
      callback();
      transitionCount.value++;
    });
  }

  return {
    renderer,
    trackRendering,
  };
}
