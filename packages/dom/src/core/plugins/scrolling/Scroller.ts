import {CorePlugin} from '@dnd-kit/abstract';
import {computed, deepEqual, reactive} from '@dnd-kit/state';
import {
  canScroll,
  detectScrollIntent,
  getScrollableAncestors,
  getElementFromPoint,
  ScrollDirection,
  scheduler,
  isKeyboardEvent,
  getDocument,
  getFrameTransform,
} from '@dnd-kit/dom/utilities';
import {Axes, type Coordinates} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';

import {ScrollIntentTracker} from './ScrollIntent.ts';

export class Scroller extends CorePlugin<DragDropManager> {
  public getScrollableElements: () => Set<Element> | null;

  private scrollIntentTracker: ScrollIntentTracker;

  @reactive
  public accessor autoScrolling = false;

  constructor(manager: DragDropManager) {
    super(manager);

    let previousElementFromPoint: Element | null = null;
    let previousScrollableElements: Set<Element> | null = null;
    const elementFromPoint = computed(() => {
      const {position} = manager.dragOperation;

      if (!position) {
        return null;
      }

      const element = getElementFromPoint(document, position.current);

      if (element) {
        previousElementFromPoint = element;
      }

      return element ?? previousElementFromPoint;
    });
    const scrollableElements = computed(() => {
      const element = elementFromPoint.value;
      const {documentElement} = getDocument(element);

      if (!element || element === documentElement) {
        const {target} = manager.dragOperation;
        const targetElement = target?.element;

        if (targetElement) {
          const elements = getScrollableAncestors(targetElement, {
            excludeElement: false,
          });
          previousScrollableElements = elements;

          return elements;
        }
      }

      if (element) {
        const elements = getScrollableAncestors(element, {
          excludeElement: false,
        });

        if (
          this.autoScrolling &&
          previousScrollableElements &&
          elements.size < previousScrollableElements?.size
        ) {
          return previousScrollableElements;
        }

        previousScrollableElements = elements;

        return elements;
      }

      previousScrollableElements = null;

      return null;
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

    if (by.y) element.scrollTop += by.y;
    if (by.x) element.scrollLeft += by.x;
  };

  public scroll = (options?: {by: Coordinates}): boolean => {
    if (this.disabled) {
      return false;
    }

    const elements = this.getScrollableElements();

    if (!elements) {
      this.#meta = undefined;
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
      const scrollIntent = intent
        ? undefined
        : this.scrollIntentTracker.current;

      if (scrollIntent?.isLocked()) {
        return false;
      }

      for (const scrollableElement of elements) {
        const elementCanScroll = canScroll(scrollableElement, by);

        if (elementCanScroll.x || elementCanScroll.y) {
          // TODO: This is likely expensive, we should try and remove the need to get the frame offset
          // on the fly and instead store it on the dragOperation.position, or something similar
          const offset = getFrameTransform(scrollableElement);
          const {speed, direction} = detectScrollIntent(
            scrollableElement,
            {x: currentPosition.x - offset.x, y: currentPosition.y - offset.y},
            intent
          );

          if (scrollIntent) {
            for (const axis of Axes) {
              if (scrollIntent[axis].isLocked(direction[axis])) {
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
              const previousScrollBy = this.#meta?.by;

              if (this.autoScrolling && previousScrollBy) {
                const scrollIntentMismatch =
                  (previousScrollBy.x && !scrollLeftBy) ||
                  (previousScrollBy.y && !scrollTopBy);

                if (scrollIntentMismatch) continue;
              }

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

    this.#meta = undefined;
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
