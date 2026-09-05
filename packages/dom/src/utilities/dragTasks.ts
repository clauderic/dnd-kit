import type {DragDropManager} from '@dnd-kit/abstract';

export interface DragTask {
  readonly current: boolean;
  waitFor(work: Promise<unknown>): Promise<boolean>;
}

/** Lifetime guards for asynchronous work returned by a plugin's event handler. */
export function createDragTasks(
  manager: DragDropManager<any, any>,
  enabled: () => boolean = () => true
) {
  const cancellations = new Set<() => void>();
  let destroyed = false;

  return {
    run(callback: (task: DragTask) => Promise<void>): Promise<void> {
      const {controller} = manager.dragOperation;
      const sourceId = manager.dragOperation.source?.id;
      if (destroyed || !controller || controller.signal.aborted)
        return Promise.resolve();

      let active = true;
      let cancel!: () => void;
      const canceled = new Promise<false>((resolve) => {
        cancel = () => {
          active = false;
          resolve(false);
        };
      });
      const task: DragTask = {
        get current() {
          const {dragOperation} = manager;
          return (
            active &&
            !destroyed &&
            enabled() &&
            dragOperation.source?.id === sourceId &&
            dragOperation.controller === controller &&
            !controller.signal.aborted &&
            dragOperation.status.dragging &&
            !dragOperation.canceled
          );
        },
        waitFor(work) {
          return Promise.race([
            work.then(
              () => task.current,
              () => false
            ),
            canceled,
          ]);
        },
      };
      cancellations.add(cancel);
      controller.signal.addEventListener('abort', cancel, {once: true});

      // Start after the entire dispatch so later listeners can prevent the event
      // or begin a controlled render before a plugin attempts its fallback.
      const work = Promise.resolve().then(() => {
        if (task.current) return callback(task);
      });
      return Promise.race([work, canceled])
        .then(() => {})
        .finally(() => {
          active = false;
          cancellations.delete(cancel);
          controller.signal.removeEventListener('abort', cancel);
        });
    },
    destroy() {
      destroyed = true;
      for (const cancel of cancellations) cancel();
    },
  };
}
