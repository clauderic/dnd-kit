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

      const initial = getAccumulatedScrollOffsets(ancestors);

      const apply = (event: Event) => {
        const {target} = event;

        if (!target || !isNode(target)) return;

        const scrolled = isDocument(target) ? target.scrollingElement : target;

        if (!isElement(scrolled) || !ancestors.has(scrolled)) {
          return;
        }

        const current = getAccumulatedScrollOffsets(ancestors);
        const delta = {
          x: current.x - initial.x,
          y: current.y - initial.y,
        };

        const previous = dragOperation.scrollAdjustment;

        if (previous.x === delta.x && previous.y === delta.y) return;

        dragOperation.scrollAdjustment = delta;

        manager.actions.move({event, virtual: true});
      };

      const root = sourceElement.ownerDocument ?? document;

      root.addEventListener('scroll', apply, listenerOptions);

      const cleanup = () => {
        root.removeEventListener('scroll', apply, listenerOptions);
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
}
