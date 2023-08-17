import {Plugin} from '@dnd-kit/abstract';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';

export class RestoreFocus extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    let lastSourceId: UniqueIdentifier | undefined;

    this.destroy = effect(() => {
      const {
        dragOperation: {status, source},
      } = manager;

      if (status.dropping) {
        lastSourceId = source?.id;
      }

      if (status.idle && lastSourceId != null) {
        const id = lastSourceId;

        requestAnimationFrame(() => {
          const draggable = this.manager.registry.draggables.get(id);
          const element = draggable?.activator ?? draggable?.element;

          if (element instanceof HTMLElement) {
            element?.focus();
          }

          lastSourceId = undefined;
        });
      }
    });
  }
}
