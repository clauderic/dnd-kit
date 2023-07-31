import {Plugin} from '@dnd-kit/abstract';
import {
  canScroll,
  shouldScroll,
  getScrollableAncestors,
  ScrollDirection,
} from '@dnd-kit/dom-utilities';
import {computed} from '@dnd-kit/state';
import {isEqual} from '@dnd-kit/utilities';

import type {DragDropManager} from '../../manager';

interface Options {}

export class Scroller extends Plugin<DragDropManager> {
  public getScrollableElements: () => Element[] | null;

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

      return element
        ? getScrollableAncestors(element, {excludeElement: false})
        : null;
    }, isEqual);

    this.getScrollableElements = () => scrollableElements.value;
  }

  public scrollBy(x: number, y: number): boolean {
    const elements = this.getScrollableElements();

    if (!elements || this.disabled) {
      return false;
    }

    const {position} = this.manager.dragOperation;
    const currentPosition = position?.current;

    if (currentPosition) {
      for (const scrollableElement of elements) {
        const elementCanScroll = canScroll(scrollableElement, {x, y});

        if ((x && elementCanScroll.x) || (y && elementCanScroll.y)) {
          const shouldScrollElement = shouldScroll(
            scrollableElement,
            currentPosition,
            {
              x: getScrollIntent(x),
              y: getScrollIntent(y),
            }
          );

          if (
            shouldScrollElement.direction.x ||
            shouldScrollElement.direction.y
          ) {
            const scrollLeftBy = x * shouldScrollElement.speed.x;
            const scrollTopBy = y * shouldScrollElement.speed.y;

            if (scrollLeftBy || scrollTopBy) {
              const {scrollTop, scrollLeft} = scrollableElement;
              scrollableElement.scrollBy(scrollLeftBy, scrollTopBy);

              if (
                scrollTop !== scrollableElement.scrollTop ||
                scrollLeft !== scrollableElement.scrollLeft
              ) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  }
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
