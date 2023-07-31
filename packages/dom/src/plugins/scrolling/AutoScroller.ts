import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {shouldScroll} from '@dnd-kit/dom-utilities';
import {Axes} from '@dnd-kit/geometry';
import {effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';

import {ScrollIntentTracker} from './ScrollIntent';

interface Options {}

const AUTOSCROLL_INTERVAL = 5;

export class AutoScroller extends Plugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    let interval: NodeJS.Timer | null = null;
    const scrollIntentTracker = ScrollIntentTracker(manager);

    this.destroy = effect(() => {
      const {position, status} = manager.dragOperation;

      if (!this.disabled && status === 'dragging') {
        const scrollIntent = scrollIntentTracker.peek();
        const scrollableElements =
          this.manager.scroller.getScrollableElements();

        if (scrollableElements) {
          for (const scrollableElement of scrollableElements) {
            const {speed, direction} = shouldScroll(
              scrollableElement,
              position.current
            );

            if (scrollIntent) {
              for (const axis of Axes) {
                if (scrollIntent[axis].isLocked(direction[axis])) {
                  speed[axis] = 0;
                  direction[axis] = 0;
                }
              }
            }

            if (speed.x > 0 || speed.y > 0) {
              const autoScroll = () => {
                const scrollLeft = speed.x * direction.x;
                const scrollTop = speed.y * direction.y;

                scrollableElement.scrollBy(scrollLeft, scrollTop);
              };

              interval = setInterval(autoScroll, AUTOSCROLL_INTERVAL);
              break;
            }
          }
        }
      }

      return () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      };
    });
  }
}
