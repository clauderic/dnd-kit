import {CorePlugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';

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
        const root = dragOperation.source?.element?.ownerDocument ?? document;

        root.addEventListener('scroll', this.handleScroll, listenerOptions);

        return () => {
          root.removeEventListener(
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
        this.manager.collisionObserver.forceUpdate(false);
        this.#timeout = undefined;
      }, 50);
    }
  };
}
