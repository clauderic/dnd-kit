import {CorePlugin} from '@dnd-kit/abstract';
import {batch, untracked} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';
import {acquireCollisionTransaction} from './transaction.ts';

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
    let destroyed = false;
    let pending: AbortController | undefined;
    let revision = 0;
    const transactions = new Set<() => void>();
    const unsubscribe = manager.monitor.addEventListener('dragover', () => {
      const {controller} = manager.dragOperation;
      if (!controller || controller.signal.aborted) return;
      revision++;
      if (pending === controller) return;
      pending = controller;
      const releaseTransaction = acquireCollisionTransaction(manager);
      const release = () => {
        transactions.delete(release);
        controller.signal.removeEventListener('abort', release);
        releaseTransaction();
      };
      transactions.add(release);
      controller.signal.addEventListener('abort', release, {once: true});

      // Read rendering after every dragover listener has had a chance to start
      // its update. This continuation measures before the target action releases
      // its render transaction; no frame or position-observer timer is needed.
      queueMicrotask(async () => {
        try {
          let measured: number;
          do {
            if (destroyed || controller.signal.aborted) return;
            measured = revision;
            await manager.renderer.rendering;
            if (destroyed || manager.dragOperation.controller !== controller)
              return;
            refreshCollisionGeometry(manager);
          } while (measured !== revision);
        } catch {
          // A rejected commit must still release collision and drop delivery.
        } finally {
          if (pending === controller) pending = undefined;
          release();
        }
      });
    });

    this.destroy = () => {
      destroyed = true;
      unsubscribe();
      for (const release of transactions) release();
    };
  }
}
