import {Plugin} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/types';
import {
  getBoundingRectangle,
  getScrollableAncestors,
  getScrollDirectionAndSpeed,
  getViewportBoundingRectangle,
  isDocumentScrollingElement,
  ScrollDirection,
} from '@dnd-kit/dom-utilities';
import {Axes} from '@dnd-kit/geometry';
import {computed, effect} from '@dnd-kit/state';
import {isEqual} from '@dnd-kit/utilities';

import type {DragDropManager} from '../../manager';

import {ScrollIntentTracker} from './ScrollIntent';

interface Options {}

const AUTOSCROLL_INTERVAL = 5;

export class AutoScroller extends Plugin<DragDropManager> {
  public destroy: CleanupFunction;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    const {dragOperation} = manager;
    const elementFromPoint = computed(() => {
      const {position} = dragOperation;

      if (!position) {
        return null;
      }

      const {x, y} = position.current;

      return document.elementFromPoint(x, y);
    });
    const scrollableElements = computed(() => {
      const element = elementFromPoint.value;

      return element
        ? getScrollableAncestors(element, {excludeElement: false})
        : null;
    }, isEqual);

    let interval: NodeJS.Timer | null = null;
    const scrollIntentTracker = ScrollIntentTracker(manager);

    this.destroy = effect(() => {
      const elements = scrollableElements.value;

      if (elements) {
        const {position} = dragOperation;
        const currentPosition = position?.current;

        if (currentPosition) {
          const scrollIntent = scrollIntentTracker.peek();

          for (const scrollableElement of elements) {
            const rect = isDocumentScrollingElement(scrollableElement)
              ? getViewportBoundingRectangle(scrollableElement)
              : getBoundingRectangle(scrollableElement);

            const {direction, speed} = getScrollDirectionAndSpeed(
              scrollableElement,
              rect,
              {
                width: 0,
                height: 0,
                top: currentPosition.y,
                bottom: currentPosition.y,
                left: currentPosition.x,
                right: currentPosition.x,
              }
            );

            if (scrollIntent) {
              for (const axis of Axes) {
                if (scrollIntent[axis].isLocked(direction[axis])) {
                  speed[axis] = 0;
                  direction[axis] = ScrollDirection.Idle;
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
