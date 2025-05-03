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

export const scheduler = new Scheduler((callback) =>
  requestAnimationFrame(callback)
);
