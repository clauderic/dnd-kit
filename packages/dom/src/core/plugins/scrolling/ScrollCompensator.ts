import {CorePlugin} from '@dnd-kit/abstract';
import {effect, untracked} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';
import {
  getScrollableAncestors,
  isDocument,
  isElement,
  isNode,
} from '@dnd-kit/dom/utilities';
import type {Coordinates} from '@dnd-kit/geometry';

const listenerOptions: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

function getAccumulatedScrollOffsets(
  ancestors: Iterable<Element>
): Coordinates {
  let x = 0;
  let y = 0;

  for (const ancestor of ancestors) {
    x += ancestor.scrollLeft;
    y += ancestor.scrollTop;
  }

  return {x, y};
}

export class ScrollCompensator extends CorePlugin<DragDropManager> {
  #ancestors: Set<Element> | null = null;
  #initial: Coordinates | null = null;

  constructor(manager: DragDropManager) {
    super(manager);

    const {dragOperation} = manager;

    this.destroy = effect(() => {
      const dragging = dragOperation.status.dragging;

      if (!dragging) return;

      const sourceElement = untracked(() => dragOperation.source?.element);

      if (!sourceElement) return;

      const ancestors = getScrollableAncestors(sourceElement);

      if (ancestors.size === 0) return;

      this.#ancestors = ancestors;
      this.#initial = getAccumulatedScrollOffsets(ancestors);

      const apply = (event: Event) => {
        const {target} = event;

        if (!target || !isNode(target)) return;

        const scrolled = isDocument(target) ? target.scrollingElement : target;

        if (!isElement(scrolled) || !ancestors.has(scrolled)) {
          return;
        }

        this.compensate(event);
      };

      const root = sourceElement.ownerDocument ?? document;

      root.addEventListener('scroll', apply, listenerOptions);

      const cleanup = () => {
        root.removeEventListener('scroll', apply, listenerOptions);
        this.#ancestors = null;
        this.#initial = null;
        unsubscribeDragEnd();
      };

      // Unsubscribe scroll event ASAP.
      // dragmove events should never be dispatched after dragend.
      const unsubscribeDragEnd = manager.monitor.addEventListener(
        'dragend',
        cleanup
      );

      return cleanup;
    });
  }

  public compensate(event?: Event) {
    if (!this.#ancestors || !this.#initial) return;

    const {dragOperation} = this.manager;
    const current = getAccumulatedScrollOffsets(this.#ancestors);
    const delta = {
      x: current.x - this.#initial.x,
      y: current.y - this.#initial.y,
    };

    const previous = dragOperation.scrollAdjustment;

    if (previous.x === delta.x && previous.y === delta.y) return;

    dragOperation.scrollAdjustment = delta;

    this.manager.actions.move({event, virtual: true});
  }
}
