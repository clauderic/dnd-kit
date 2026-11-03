/** Restore keyboard focus without stealing it from a later user interaction. */
export function scheduleFocusRestoration(
  document: Document,
  getTarget: () => HTMLElement | undefined,
  timeout = 0
): () => void {
  const window = document.defaultView!;
  const deadline = window.performance.now() + timeout;
  let canceled = false;
  let frame: number;
  let timer: number | undefined;

  const cancel = () => {
    canceled = true;
    window.cancelAnimationFrame(frame);
    window.clearTimeout(timer);
    document.removeEventListener('focusin', cancel, true);
    document.removeEventListener('pointerdown', cancel, true);
    document.removeEventListener('keydown', cancel, true);
  };

  const restore = () => {
    if (canceled) return;
    if (timer !== undefined && window.performance.now() >= deadline) {
      cancel();
      return;
    }

    const target = getTarget();
    let activeElement = document.activeElement;

    while (activeElement?.shadowRoot?.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    // The application may already have moved focus in its drop handler.
    if (
      activeElement &&
      activeElement !== document.body &&
      activeElement !== document.documentElement &&
      activeElement !== target
    ) {
      cancel();
      return;
    }

    if (target?.isConnected) {
      cancel();
      target.focus();
      return;
    }

    const remaining = deadline - window.performance.now();

    if (remaining <= 0) {
      cancel();
      return;
    }

    timer ??= window.setTimeout(cancel, remaining);
    frame = window.requestAnimationFrame(restore);
  };

  document.addEventListener('focusin', cancel, true);
  document.addEventListener('pointerdown', cancel, true);
  document.addEventListener('keydown', cancel, true);
  // Always allow the existing one-frame attempt, even for a very short duration.
  // Only a missing target starts retries, bounded by the original deadline.
  frame = window.requestAnimationFrame(restore);

  return cancel;
}
