export class Scheduler {
  private animationFrame: number | undefined;
  private tasks: Set<() => void> = new Set();
  private resolvers: Set<() => void> = new Set();

  public schedule(task: () => void): Promise<void> {
    this.tasks.add(task);

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.flush);
    }

    return new Promise<void>((resolve) => this.resolvers.add(resolve));
  }

  public flush = () => {
    const {tasks, resolvers} = this;

    this.animationFrame = undefined;
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

export const scheduler = new Scheduler();
