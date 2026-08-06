type Callback = () => void;

export class Scheduler<T extends (callback: Callback) => any> {
  constructor(private scheduler: T) {}

  private pending: boolean = false;
  private tasks: Set<() => void> = new Set();
  private resolvers: Set<() => void> = new Set();

  public schedule(task: () => void): Promise<void> {
    this.tasks.add(task);

    if (!this.pending) {
      this.pending = true;
      this.scheduler(this.flush);
    }

    return new Promise<void>((resolve) => this.resolvers.add(resolve));
  }

  public flush = () => {
    const {tasks, resolvers} = this;

    this.pending = false;
    this.tasks = new Set();
    this.resolvers = new Set();

    for (const task of tasks) {
      task();
    }

    for (const resolve of resolvers) {
      resolve();
    }
  };
}

// AFTER:
export const scheduler = new Scheduler((callback) => {
  // If the main document is hidden (e.g. user opened a popup window), run rAF
  // on the visible popup window instead so the scheduler isn't throttled.
  try {
    if (typeof document !== 'undefined' && document.hidden) {
      const extraDocuments = (globalThis as any).__dndKitDocuments__ as Set<Document> | undefined;
      if (extraDocuments) {
        for (const extraDoc of extraDocuments) {
          const win = extraDoc?.defaultView;
          if (win && extraDoc.visibilityState === 'visible' && typeof win.requestAnimationFrame === 'function') {
            win.requestAnimationFrame(callback);
            return;
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(callback);
  } else {
    callback();
  }
});
