import {DragOperationStatus, Plugin} from '@dnd-kit/abstract';
import {PubSub} from '@dnd-kit/utilities';
import {batch, effect} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/types';

import type {DragDropManager} from '../../manager';

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

    const {dragOperation} = this.manager;

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

        const source = this.manager.dragOperation.source;

        batch(() => {
          for (const droppable of this.manager.registry.droppable) {
            if (!source?.type || droppable.accepts(source.type)) {
              droppable.updateShape();
            }
          }
        });

        this.animationFrame = null;
      });
    }
  };
}
