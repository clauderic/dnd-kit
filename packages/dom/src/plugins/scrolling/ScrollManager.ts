import {DragOperationStatus, Plugin} from '@dnd-kit/abstract';
import {PubSub} from '@dnd-kit/utilities';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import {CleanupFunction} from '@dnd-kit/types';

const listenerOptions: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

export class ScrollManager extends Plugin<DragDropManager> {
  private pubSub = new PubSub();
  private animationFrame: number | null = null;

  public destroy: CleanupFunction;
  public subscribe = this.pubSub.subscribe;
  public unsubscribe = this.pubSub.unsubscribe;

  constructor(manager: DragDropManager) {
    super(manager);

    const {dragOperation, registry} = this.manager;

    const effectCleanup = effect(() => {
      const enabled = dragOperation.status === DragOperationStatus.Dragging;

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

    this.destroy = () => {
      effectCleanup();
      this.pubSub.clear();
    };
  }

  private handleScroll = () => {
    if (this.animationFrame === null) {
      this.animationFrame = requestAnimationFrame(() => {
        this.pubSub.notify();

        for (const droppable of this.manager.registry.droppable) {
          droppable.update();
        }

        this.animationFrame = null;
      });
    }
  };
}
