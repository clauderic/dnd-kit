import {effect} from '@dnd-kit/state';
import {
  InlineStyles,
  supportsViewTransition,
  scheduler,
} from '@dnd-kit/dom-utilities';
import type {CleanupFunction} from '@dnd-kit/types';

import {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';
import {BoundingRectangle} from '@dnd-kit/geometry';

const VIEW_TRANSITION_NAME = 'dnd-kit--drop-animation';

const INSIGNIFICANT_DELTA = 1;

class Overlay {
  private destroy: CleanupFunction;
  private element: HTMLDialogElement;

  private dropAnimation: () => Promise<void>;
  private transform = {
    x: 0,
    y: 0,
  };

  constructor(
    private manager: DragDropManager,
    boundingRectangle: BoundingRectangle
  ) {
    const {top, left, width, height} = boundingRectangle;
    const element = document.createElement('dialog');
    const style = document.createElement('style');

    element.style.setProperty('all', 'initial');
    element.style.pointerEvents = 'none';
    element.style.setProperty('position', 'fixed');
    element.style.setProperty('top', `${top}px`);
    element.style.setProperty('left', `${left}px`);
    element.style.setProperty('width', `${width}px`);
    element.style.setProperty('height', `${height}px`);
    element.style.setProperty('touch-action', 'none');

    element.setAttribute('data-dnd-kit-overlay', '');
    style.innerText = `dialog[data-dnd-kit-overlay]::backdrop {display: none;}`;
    element.appendChild(style);

    this.element = element;

    const effectCleanup = effect(() => {
      const {dragOperation} = manager;
      const {initialized, transform} = dragOperation;

      if (initialized) {
        this.transform = transform;

        scheduler.schedule(() => {
          const {x, y} = this.transform;

          element.style.setProperty(
            'transform',
            `translate3d(${x}px, ${y}px, 0)`
          );

          dragOperation.shape = new DOMRectangle(element);
        });
      }
    });

    this.destroy = () => {
      effectCleanup();
    };

    const id = manager.dragOperation.source?.id;

    this.dropAnimation = () =>
      new Promise((resolve) => {
        if (manager.dragOperation.status === 'dragging') {
          this.element.remove();
          resolve();
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
            this.element.remove();
            resolve();
          };

          elementStyles?.set({
            visibility: 'hidden',
          });

          if (supportsViewTransition(document)) {
            this.element.style.setProperty(
              'view-transition-name',
              VIEW_TRANSITION_NAME
            );

            const transition = document.startViewTransition(() => {
              elementStyles?.set({
                visibility: 'visible',
                viewTransitionName: VIEW_TRANSITION_NAME,
              });
              this.element.remove();
            });

            transition.finished.then(onFinish);
            return;
          }

          if (element) {
            const {center} = new DOMRectangle(this.element);
            const {center: elementCenter} = new DOMRectangle(element);
            const delta = {
              x: center.x - elementCenter.x,
              y: center.y - elementCenter.y,
            };

            if (
              Math.abs(delta.x) > INSIGNIFICANT_DELTA ||
              Math.abs(delta.y) > INSIGNIFICANT_DELTA
            ) {
              const finalTransform = {
                x: this.transform.x - delta.x,
                y: this.transform.y - delta.y,
              };

              this.element
                .animate(
                  {
                    transform: [
                      this.element.style.transform,
                      `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0)`,
                    ],
                  },
                  {
                    duration: 250,
                    easing: 'ease',
                  }
                )
                .finished.then(onFinish);
              return;
            }
          }

          onFinish();
        });
      });
  }

  private connectedCallback() {
    this.element.showModal();
    this.manager.dragOperation.shape = new DOMRectangle(this.element);
  }

  public remove() {
    this.destroy();
    this.dropAnimation();
  }

  public appendTo(element: Element) {
    element.appendChild(this.element);
    this.connectedCallback();
  }

  public appendChild(element: Element) {
    this.element.appendChild(element);
  }
}

export function createOverlay(
  manager: DragDropManager,
  boundingRectangle: BoundingRectangle
): Overlay {
  return new Overlay(manager, boundingRectangle);
}
