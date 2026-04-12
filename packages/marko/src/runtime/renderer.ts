/**
 * Renderer bridge between dnd-kit's state machine and Marko's scheduler.
 *
 * dnd-kit awaits `manager.renderer.rendering` in three places in actions.ts:
 *   1. After beforedragstart → before transitioning to Dragging state
 *   2. After dragend → before transitioning to Dropped state
 *   3. After drop animation cleanup
 *
 * We must resolve AFTER Marko has processed any state changes triggered
 * by the event callbacks — otherwise drag state transitions misfire.
 *
 * Marko schedules renders via: schedule() → queueMicrotask(flushAndWaitFrame)
 * flushAndWaitFrame calls run() SYNCHRONOUSLY (all renders + effects complete).
 *
 * Double queueMicrotask ensures we resolve after Marko's flush:
 *   callback() → Marko queueMicrotask[A: flushAndWaitFrame]
 *   queueMicrotask[B: () => queueMicrotask(resolve)]
 *   [A] fires → run() → all renders + effects complete
 *   [B] fires → queueMicrotask[C: resolve]
 *   [C] fires → promise resolves ✓
 */

import type {DragDropManager} from '@dnd-kit/dom';

type Renderer = DragDropManager['renderer'];

export function createRenderer(): {
  renderer: Renderer;
  trackRendering: (callback: () => void) => void;
} {
  let rendering: Promise<void> | null = null;
  let resolver: (() => void) | null = null;

  const renderer: Renderer = {
    get rendering() {
      return rendering ?? Promise.resolve();
    },
  };

  function trackRendering(callback: () => void): void {
    if (!rendering) {
      rendering = new Promise<void>((resolve) => {
        resolver = resolve;
      });
    }

    callback();

    queueMicrotask(() => {
      queueMicrotask(() => {
        resolver?.();
        rendering = null;
        resolver = null;
      });
    });
  }

  return {renderer, trackRendering};
}