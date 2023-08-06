export class Scheduler {
  private animationFrame: number | undefined;
  private tasks: (() => void)[] = [];

  public schedule(task: () => void) {
    this.tasks.push(task);

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.flush);
    }
  }

  public flush = () => {
    const tasks = this.tasks;

    this.animationFrame = undefined;
    this.tasks = [];

    for (const task of tasks) {
      task();
    }
  };
}

export const scheduler = new Scheduler();
