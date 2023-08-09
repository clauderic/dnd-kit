import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import {Scroller} from './Scroller';

interface Options {}

const AUTOSCROLL_INTERVAL = 10;

export class AutoScroller extends Plugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    const scroller = manager.plugins.get(Scroller);

    if (!scroller) {
      throw new Error('AutoScroller plugin depends on Scroller plugin');
    }

    this.destroy = effect(() => {
      if (this.disabled) {
        return;
      }

      // We consume the position from the drag operation
      // so that this effect is run when the position changes
      const {position: _, status} = manager.dragOperation;

      if (status === 'dragging') {
        const canScroll = scroller.scroll();

        if (canScroll) {
          const interval = setInterval(scroller.scroll, AUTOSCROLL_INTERVAL);

          return () => {
            clearInterval(interval);
          };
        }
      }
    });
  }
}
