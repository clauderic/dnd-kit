import {effect, untracked} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  isKeyboardEvent,
  DOMRectangle,
  scheduler,
  createPlaceholder,
} from '@dnd-kit/dom/utilities';
import {BoundingRectangle, Rectangle} from '@dnd-kit/geometry';

import {DragDropManager} from '../../manager/index.js';
import type {Transition} from './types.js';
import css from './Overlay.css';

const INSIGNIFICANT_DELTA = 1;

interface Options {
  anchor: Element;
  boundingRectangle?: BoundingRectangle;
  tagName?: string;
  transition?: Transition | null;
}

const defaultTransition: Transition = {
  duration: 250,
  easing: 'ease',
};

export class Overlay {
  constructor(
    private manager: DragDropManager,
    private options: Options
  ) {
    const {
      anchor,
      boundingRectangle = new DOMRectangle(anchor),
      tagName = anchor.parentElement?.tagName.toLowerCase(),
    } = options;
    const {top, left, width, height} = boundingRectangle;
    const element = document.createElement(tagName || 'dialog');
    const style = document.createElement('style');
    style.innerText = css.trim().replace(/\s+/g, '');

    element.style.setProperty('top', `${top}px`);
    element.style.setProperty('left', `${left}px`);

    element.style.setProperty('width', `${width}px`);
    element.style.setProperty('height', `${height}px`);

    if (isKeyboardEvent(manager.dragOperation.activatorEvent)) {
      element.style.setProperty('transition', 'transform 150ms ease');
    }

    document.head.appendChild(style);
    element.setAttribute('data-dnd-kit-overlay', '');

    this.element = element;

    const currentPosition = untracked(
      () => manager.dragOperation.position.current
    );
    const transformOrigin = {
      x: (currentPosition.x - left) / width,
      y: (currentPosition.y - top) / height,
    };

    effect(() => {
      const {source} = manager.dragOperation;

      if (!source || !source.element) {
        return;
      }

      let isFirstEvent = true;

      const resizeObserver = new ResizeObserver((entries) => {
        if (isFirstEvent) {
          isFirstEvent = false;
          return;
        }

        const {target} = entries[0];
        const {width, height} = new DOMRectangle(target, true);
        const currentWidth = parseInt(element.style.width, 10);
        const currentHeight = parseInt(element.style.height, 10);
        const deltaX = currentWidth - width;
        const deltaY = currentHeight - height;
        const {x, y} = this.delta;

        this.delta = {
          x: x + deltaX * transformOrigin.x,
          y: y + deltaY * transformOrigin.y,
        };

        element.style.setProperty('width', `${width}px`);
        element.style.setProperty('height', `${height}px`);

        untracked(updatePosition);
      });
      resizeObserver.observe(source.element);

      return () => {
        resizeObserver.disconnect();
      };
    });

    const updatePosition = () => {
      const transform = manager.dragOperation.transform;
      const x = transform.x + this.delta.x;
      const y = transform.y + this.delta.y;

      manager.dragOperation.shape = new DOMRectangle(
        element.firstElementChild ?? element
      ).translate(x - this.transform.x, y - this.transform.y);
      element.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);

      this.transform = {x, y};
    };

    this.destroy = effect(() => {
      const {dragOperation} = manager;
      const {status, transform: _} = dragOperation;

      if (status.initialized) {
        scheduler.schedule(updatePosition);
      }
    });
  }

  public isConnected = false;

  private element: HTMLElement;

  private destroy: CleanupFunction;

  private transform = {
    x: 0,
    y: 0,
  };

  private delta = {
    x: 0,
    y: 0,
  };

  private connectedCallback() {
    this.isConnected = true;

    if (this.element instanceof HTMLDialogElement) {
      this.element.showModal();
    }

    this.manager.dragOperation.shape = new DOMRectangle(this.element);
  }

  public appendTo(parentElement: Element) {
    parentElement.appendChild(this.element);
    this.connectedCallback();
  }

  public set children(element: Element) {
    if (this.element.firstElementChild === element) {
      return;
    }

    this.element.replaceChildren(element);
  }

  public contains(element: Element) {
    return this.element.contains(element);
  }

  public dropAnimation() {
    return new Promise<void>((resolve) => {
      const {manager} = this;
      const {transition = defaultTransition} = this.options;
      const {source} = manager.dragOperation;
      const unmount = () => {
        this.element.remove();
        resolve();
      };

      if (!transition || !source || !manager.dragOperation.status.dropping) {
        unmount();
        return;
      }

      const {id} = source;
      const draggable = id != null ? manager.registry.draggables.get(id) : null;
      const element = draggable?.element;
      const currentShape = manager.dragOperation.shape?.current;

      if (element && currentShape) {
        const shape = new DOMRectangle(element);
        const {center} = currentShape;
        const centerDelta = {
          x: center.x - shape.center.x,
          y: center.y - shape.center.y,
        };

        if (
          Math.abs(centerDelta.x) > INSIGNIFICANT_DELTA ||
          Math.abs(centerDelta.y) > INSIGNIFICANT_DELTA
        ) {
          const finalTransform = {
            x: this.transform.x - centerDelta.x,
            y: this.transform.y - centerDelta.y,
          };
          const placeholder = createPlaceholder(
            element,
            draggable.feedback === 'clone'
          );

          element.replaceWith(placeholder);
          this.element.appendChild(element);

          this.element
            .animate(
              {
                transform: [
                  this.element.style.transform,
                  `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0)`,
                ],
              },
              {
                duration: transition.duration,
                easing: transition.easing,
              }
            )
            .finished.then(() => {
              placeholder.replaceWith(element);
              unmount();
            });
          return;
        }
      }

      unmount();
    });
  }

  public remove() {
    this.destroy();

    return this.dropAnimation();
  }
}
