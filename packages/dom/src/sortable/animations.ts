export interface SortableAnimation {
  /**
   * Cancels anything that would skew the measurement.
   * Returns `false` to skip the animation.
   */
  prepare(): boolean;
  /**
   * Reads the element's new position.
   * Returns `false` if there is nothing to animate.
   */
  measure(): boolean;
  /** Starts the animation. */
  animate(): void;
}

let pending: SortableAnimation[] = [];

function flush() {
  const animations = pending;
  pending = [];

  // Every write happens before any read, and every read before any write, so
  // the browser computes layout once for the whole batch instead of once per
  // sortable when many of them move at the same time.
  const prepared = animations.filter((animation) => animation.prepare());
  const measured = prepared.filter((animation) => animation.measure());

  for (const animation of measured) {
    animation.animate();
  }
}

/**
 * Batches the animations of sortables that move at the same time.
 */
export function scheduleAnimation(animation: SortableAnimation) {
  pending.push(animation);

  if (pending.length === 1) {
    queueMicrotask(flush);
  }
}
