import {Plugin} from '@dnd-kit/abstract';
import {computed} from '@dnd-kit/state';
import {
  canScroll,
  detectScrollIntent,
  getScrollableAncestors,
  ScrollDirection,
  scheduler,
} from '@dnd-kit/dom-utilities';
import {Axes, type Coordinates} from '@dnd-kit/geometry';
import {isEqual} from '@dnd-kit/utilities';

import type {DragDropManager} from '../../manager';

import {ScrollIntentTracker} from './ScrollIntent';

interface Options {}

export class Scroller extends Plugin<DragDropManager> {
  public getScrollableElements: () => Element[] | null;

  private scrollIntentTracker: ScrollIntentTracker;

  constructor(manager: DragDropManager, _options?: Options) {
    super(manager);

    const elementFromPoint = computed(() => {
      const {position} = manager.dragOperation;

      if (!position) {
        return null;
      }

      const {x, y} = position.current;

      return document.elementFromPoint(x, y);
    });
    const scrollableElements = computed(() => {
      const element = elementFromPoint.value;

      if (!element || element === document.documentElement) {
        const targetElement = manager.dragOperation.target?.element;

        if (targetElement) {
          return getScrollableAncestors(targetElement, {excludeElement: false});
        }
      }

      return element
        ? getScrollableAncestors(element, {excludeElement: false})
        : null;
    }, isEqual);

    this.getScrollableElements = () => {
      return scrollableElements.value;
    };

    this.scrollIntentTracker = new ScrollIntentTracker(manager);
  }

  public scroll = (options?: {by: Coordinates}): boolean => {
    if (this.disabled) {
      return false;
    }

    const elements = this.getScrollableElements();

    if (!elements) {
      return false;
    }

    const {position} = this.manager.dragOperation;
    const currentPosition = position?.current;

    if (currentPosition) {
      const {by} = options ?? {};
      const intent = by
        ? {
            x: getScrollIntent(by.x),
            y: getScrollIntent(by.y),
          }
        : undefined;
      const trackedScrollIntent = intent
        ? undefined
        : this.scrollIntentTracker.current;

      if (trackedScrollIntent?.isLocked()) {
        return false;
      }

      for (const scrollableElement of elements) {
        const elementCanScroll = canScroll(scrollableElement, by);

        if (elementCanScroll.x || elementCanScroll.y) {
          const {speed, direction} = detectScrollIntent(
            scrollableElement,
            currentPosition,
            intent
          );

          if (trackedScrollIntent) {
            for (const axis of Axes) {
              if (trackedScrollIntent[axis].isLocked(direction[axis])) {
                speed[axis] = 0;
                direction[axis] = 0;
              }
            }
          }

          if (direction.x || direction.y) {
            const {x, y} = by ?? direction;
            const scrollLeftBy = x * speed.x;
            const scrollTopBy = y * speed.y;

            if (scrollLeftBy || scrollTopBy) {
              scheduler.schedule(() => {
                scrollableElement.scrollBy(scrollLeftBy, scrollTopBy);
              });

              return true;
            }
          }
        }
      }
    }

    return false;
  };
}

function getScrollIntent(value: number) {
  if (value > 0) {
    return ScrollDirection.Forward;
  }

  if (value < 0) {
    return ScrollDirection.Reverse;
  }

  return ScrollDirection.Idle;
}
