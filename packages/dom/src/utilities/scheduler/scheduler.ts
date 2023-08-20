export class Scheduler {
  private animationFrame: number | undefined;
  private tasks: Set<() => void> = new Set();

  public schedule(task: () => void) {
    this.tasks.add(task);

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.flush);
    }
  }

  public flush = () => {
    const tasks = this.tasks;

    this.animationFrame = undefined;
    this.tasks = new Set();

    for (const task of tasks) {
      task();
    }
  };
}

export const scheduler = new Scheduler();
