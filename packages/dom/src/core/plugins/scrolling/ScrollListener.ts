import {DragOperationStatus, CorePlugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.js';

const listenerOptions: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

export class ScrollListener extends CorePlugin<DragDropManager> {
  #timeout: NodeJS.Timeout | undefined;

  constructor(manager: DragDropManager) {
    super(manager);

    const {dragOperation} = this.manager;

    this.destroy = effect(() => {
      const enabled = dragOperation.status.dragging;

      if (enabled) {
        document.addEventListener('scroll', this.handleScroll, listenerOptions);

        return () => {
          document.removeEventListener(
            'scroll',
            this.handleScroll,
            listenerOptions
          );
        };
      }
    });
  }

  private handleScroll = () => {
    if (this.#timeout == null) {
      this.#timeout = setTimeout(() => {
        this.manager.collisionObserver.forceUpdate();

        this.#timeout = undefined;
      }, 50);
    }
  };
}
