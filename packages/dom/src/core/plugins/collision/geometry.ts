import {CorePlugin} from '@dnd-kit/abstract';
import {batch, untracked} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';
import {createDragTasks} from '../../../utilities/dragTasks.ts';

/** One coherent measurement pass for changes that can move multiple targets. */
export function refreshCollisionGeometry(manager: DragDropManager) {
  untracked(() => {
    const {source, controller, status} = manager.dragOperation;
    if (!status.dragging || !source || controller?.signal.aborted) return;

    batch(() => {
      for (const entry of manager.registry.droppables) {
        if (
          !entry.disabled &&
          entry.accepts(source) &&
          entry.element?.isConnected
        ) {
          entry.refreshShape();
        }
      }
    });
  });
}

/** Internal: controlled moves need the same commit measurement as sorting. */
export class CollisionGeometry extends CorePlugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);
    const tasks = createDragTasks(manager);
    let pending: {controller: AbortController; work: Promise<void>} | undefined;
    let revision = 0;
    const unsubscribe = manager.monitor.addEventListener('dragover', () => {
      const {controller} = manager.dragOperation;
      if (!controller || controller.signal.aborted) return;
      revision++;
      if (pending?.controller === controller) return pending.work;
      const work = tasks.run(async (task) => {
        try {
          let measured: number;
          do {
            measured = revision;
            if (!(await task.waitFor(manager.renderer.rendering))) return;
            refreshCollisionGeometry(manager);
          } while (measured !== revision);
        } finally {
          if (pending?.work === work) pending = undefined;
        }
      });
      pending = {controller, work};
      return work;
    });

    this.destroy = () => {
      unsubscribe();
      tasks.destroy();
    };
  }
}
