import {effect} from '@dnd-kit/state';
import {InlineStyles, supportsViewTransition} from '@dnd-kit/dom-utilities';
import type {CleanupFunction} from '@dnd-kit/types';

import {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

const VIEW_TRANSITION_NAME = 'dnd-kit--drop-animation';

class DraggableOverlay extends HTMLElement {
  private destroy: CleanupFunction;

  private dropAnimation: () => void;

  constructor(manager: DragDropManager, element: Element) {
    super();

    const {top, left, width, height} = element.getBoundingClientRect();

    this.style.pointerEvents = 'none';
    this.style.setProperty('position', 'fixed');
    this.style.setProperty('top', `${top}px`);
    this.style.setProperty('left', `${left}px`);
    this.style.setProperty('width', `${width}px`);
    this.style.setProperty('height', `${height}px`);

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {position, status} = dragOperation;
      const {x, y} = position.delta;

      if (status === 'dragging') {
        this.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);
        dragOperation.shape = new DOMRectangle(this);
      }
    });

    const id = manager.dragOperation.source?.id;

    this.dropAnimation = () => {
      requestAnimationFrame(() => {
        if (supportsViewTransition(document)) {
          const draggable =
            id != null ? manager.registry.draggable.get(id) : null;
          const element = draggable?.element;
          const elementStyles =
            element instanceof HTMLElement ? new InlineStyles(element) : null;

          this.style.setProperty('view-transition-name', VIEW_TRANSITION_NAME);
          elementStyles?.set({
            visibility: 'hidden',
          });

          const transition = document.startViewTransition(() => {
            super.remove();
            elementStyles?.set({
              visibility: 'visible',
              viewTransitionName: VIEW_TRANSITION_NAME,
            });
          });

          transition.finished.then(() => {
            elementStyles?.reset();
          });
        }
      });
    };
  }

  remove() {
    this.destroy();

    if (supportsViewTransition(document)) {
      this.dropAnimation();
      return;
    }

    super.remove();
  }
}

export function createOverlay(
  manager: DragDropManager,
  element: Element
): DraggableOverlay {
  if (customElements.get('draggable-overlay') == null) {
    customElements.define('draggable-overlay', DraggableOverlay);
  }

  return new DraggableOverlay(manager, element);
}
