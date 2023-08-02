import {effect} from '@dnd-kit/state';
import {InlineStyles, supportsViewTransition} from '@dnd-kit/dom-utilities';
import type {CleanupFunction} from '@dnd-kit/types';

import {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

const VIEW_TRANSITION_NAME = 'dnd-kit--drop-animation';

class Overlay extends HTMLElement {
  private destroy: CleanupFunction;

  private dropAnimation: () => void;
  private transform = {
    x: 0,
    y: 0,
  };

  constructor(
    private manager: DragDropManager,
    element: Element
  ) {
    super();

    const {top, left, width, height} = element.getBoundingClientRect();

    this.style.pointerEvents = 'none';
    this.style.setProperty('position', 'fixed');
    this.style.setProperty('top', `${top}px`);
    this.style.setProperty('left', `${left}px`);
    this.style.setProperty('width', `${width}px`);
    this.style.setProperty('height', `${height}px`);

    const effectCleanup = effect(() => {
      const {dragOperation} = manager;
      const {initialized, transform} = dragOperation;
      const {x, y} = transform;

      if (initialized) {
        this.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);
        this.transform = transform;

        if (this.isConnected) {
          dragOperation.shape = new DOMRectangle(this);
        }
      }
    });

    this.destroy = () => {
      effectCleanup();
    };

    const id = manager.dragOperation.source?.id;

    this.dropAnimation = () => {
      if (manager.dragOperation.status === 'dragging') {
        super.remove();
        return;
      }

      requestAnimationFrame(() => {
        const draggable =
          id != null ? manager.registry.draggable.get(id) : null;
        const element = draggable?.element;
        const elementStyles =
          element instanceof HTMLElement ? new InlineStyles(element) : null;
        const onFinish = () => {
          elementStyles?.reset();
          super.remove();
        };

        elementStyles?.set({
          visibility: 'hidden',
        });

        if (supportsViewTransition(document)) {
          this.style.setProperty('view-transition-name', VIEW_TRANSITION_NAME);

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
          return;
        }

        if (element) {
          const {top, left} = this.getBoundingClientRect();
          const {top: elementTop, left: elementLeft} =
            element.getBoundingClientRect();
          const delta = {
            x: left - elementLeft,
            y: top - elementTop,
          };
          const finalTransform = {
            x: this.transform.x - delta.x,
            y: this.transform.y - delta.y,
          };

          if (
            this.transform.x !== finalTransform.x ||
            this.transform.y !== finalTransform.y
          ) {
            this.animate(
              {
                transform: [
                  this.style.transform,
                  `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0)`,
                ],
              },
              {
                duration: 250,
                easing: 'ease',
              }
            ).finished.then(onFinish);
            return;
          }
        }

        onFinish();
      });
    };
  }

  connectedCallback() {
    this.manager.dragOperation.shape = new DOMRectangle(this);
  }

  remove() {
    this.destroy();
    this.dropAnimation();
  }
}

export function createOverlay(
  manager: DragDropManager,
  element: Element
): Overlay {
  if (customElements.get('draggable-overlay') == null) {
    customElements.define('draggable-overlay', Overlay);
  }

  return new Overlay(manager, element);
}
