import {CorePlugin} from '@dnd-kit/abstract';
import {computed, deepEqual} from '@dnd-kit/state';
import {
  canScroll,
  detectScrollIntent,
  getScrollableAncestors,
  ScrollDirection,
  scheduler,
  isKeyboardEvent,
} from '@dnd-kit/dom/utilities';
import {Axes, type Coordinates} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';

import {ScrollIntentTracker} from './ScrollIntent.ts';

export class Scroller extends CorePlugin<DragDropManager> {
  public getScrollableElements: () => Set<Element> | null;

  private scrollIntentTracker: ScrollIntentTracker;

  constructor(manager: DragDropManager) {
    super(manager);

    let previousElementFromPoint: Element | null = null;
    const elementFromPoint = computed(() => {
      const {position} = manager.dragOperation;

      if (!position) {
        return null;
      }

      const {x, y} = position.current;
      const element = document.elementFromPoint(x, y);

      if (element) {
        previousElementFromPoint = element;
      }

      return document.elementFromPoint(x, y) ?? previousElementFromPoint;
    });
    const scrollableElements = computed(() => {
      const element = elementFromPoint.value;

      if (!element || element === document.documentElement) {
        const {target} = manager.dragOperation;
        const targetElement = target?.element;

        if (targetElement) {
          return getScrollableAncestors(targetElement, {excludeElement: false});
        }
      }

      return element
        ? getScrollableAncestors(element, {excludeElement: false})
        : null;
    }, deepEqual);

    this.getScrollableElements = () => {
      return scrollableElements.value;
    };

    this.scrollIntentTracker = new ScrollIntentTracker(manager);

    this.destroy = manager.monitor.addEventListener('dragmove', (event) => {
      if (
        this.disabled ||
        event.defaultPrevented ||
        !isKeyboardEvent(manager.dragOperation.activatorEvent) ||
        !event.by
      ) {
        return;
      }

      // Prevent the move event if we can scroll to the new coordinates
      if (this.scroll({by: event.by})) {
        event.preventDefault();
      }
    });
  }

  #meta: {element: Element; by: Coordinates} | undefined;

  #scroll = () => {
    if (!this.#meta) {
      return;
    }

    const {element, by} = this.#meta;

    element.scrollBy(by.x, by.y);
  };

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
              this.#meta = {
                element: scrollableElement,
                by: {
                  x: scrollLeftBy,
                  y: scrollTopBy,
                },
              };

              scheduler.schedule(this.#scroll);

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
