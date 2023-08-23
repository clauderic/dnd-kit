import {effects, untracked} from '@dnd-kit/state';
import type {CleanupFunction} from '@dnd-kit/state';
import {
  isKeyboardEvent,
  DOMRectangle,
  scheduler,
  createPlaceholder,
} from '@dnd-kit/dom/utilities';

import {DragDropManager} from '../../manager/index.js';
import type {Transition} from './types.js';
import css from './Overlay.css';

const INSIGNIFICANT_DELTA = 1;

interface Options {
  anchor: Element;
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
    const {anchor, tagName = anchor.parentElement?.tagName.toLowerCase()} =
      options;
    const shape = new DOMRectangle(anchor);
    const {top, left, width, height} = shape.boundingRectangle;
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
    this.updatePosition = this.updatePosition.bind(this);

    const currentPosition = untracked(
      () => manager.dragOperation.position.current
    );
    const transformOrigin = {
      x: (currentPosition.x - left) / width,
      y: (currentPosition.y - top) / height,
    };

    this.destroy = effects(
      () => {
        const {dragOperation} = manager;
        const {status, transform: _} = dragOperation;

        if (status.dragging) {
          scheduler.schedule(this.updatePosition);
        }
      },
      () => {
        const {source} = manager.dragOperation;

        if (!source?.element) {
          return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
          const {target} = entries[0];
          const {width, height} = new DOMRectangle(target, true);
          const deltaX = parseFloat(
            (shape.boundingRectangle.width - width).toFixed(2)
          );
          const deltaY = parseFloat(
            (shape.boundingRectangle.height - height).toFixed(2)
          );

          this.delta = {
            x: deltaX * transformOrigin.x,
            y: deltaY * transformOrigin.y,
          };

          this.resize(width, height);
        });

        resizeObserver.observe(source.element);

        return () => {
          resizeObserver.disconnect();
        };
      }
    );
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

  public resize(width: number, height: number) {
    const {element} = this;

    const transition = element.style.getPropertyValue('transition');

    if (transition) {
      element.style.setProperty('transition', '');
    }

    element.style.setProperty('width', `${width}px`);
    element.style.setProperty('height', `${height}px`);
    this.updatePosition();

    if (transition) {
      element.style.setProperty('transition', transition);
    }
  }

  private updatePosition() {
    const {manager, element} = this;

    const transform = manager.dragOperation.transform;
    const x = transform.x + this.delta.x;
    const y = transform.y + this.delta.y;

    manager.dragOperation.shape = new DOMRectangle(
      element.firstElementChild ?? element
    ).translate(x - this.transform.x, y - this.transform.y);
    element.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);

    this.transform = {x, y};
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
      const currentShape = new DOMRectangle(this.element);

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
                  `translate3d(${this.transform.x}px, ${this.transform.y}px, 0)`,
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
