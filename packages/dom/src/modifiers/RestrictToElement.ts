import {Modifier, configurator} from '@dnd-kit/abstract';
import {restrictShapeToBoundingRectangle} from '@dnd-kit/abstract/modifiers';
import {BoundingRectangle, Rectangle} from '@dnd-kit/geometry';
import {effect, signal} from '@dnd-kit/state';
import type {DragDropManager} from '@dnd-kit/dom';
import {getBoundingRectangle} from '@dnd-kit/dom/utilities';

interface Options {
  element?: Element | null;
  getElement?(operation: DragDropManager['dragOperation']): Element | null;
}

export class RestrictToElement extends Modifier<DragDropManager, Options> {
  private boundingRectangle = signal<BoundingRectangle | null>(null);

  constructor(manager: DragDropManager, options?: Options) {
    super(manager, options);

    this.destroy = effect(() => {
      if (!this.options) {
        return;
      }

      const {dragOperation} = manager;
      const {status} = dragOperation;

      if (status.initialized) {
        const {element, getElement} = this.options;
        const target = element ?? getElement?.(dragOperation);

        if (!target) {
          return;
        }

        let timeout: NodeJS.Timeout | undefined;
        const updateBoundingRectangle = () => {
          this.boundingRectangle.value = getBoundingRectangle(target);
        };
        const handleScroll = () => {
          if (timeout) {
            return;
          }

          timeout = setTimeout(() => {
            updateBoundingRectangle();
            timeout = undefined;
          }, 25);
        };
        const resizeObserver = new ResizeObserver(updateBoundingRectangle);

        resizeObserver.observe(target);

        document.addEventListener('scroll', handleScroll, {
          passive: true,
          capture: true,
        });

        return () => {
          document.removeEventListener('scroll', handleScroll, {
            capture: true,
          });
          resizeObserver.disconnect();
          this.boundingRectangle.value = null;
        };
      }
    });
  }

  apply(operation: DragDropManager['dragOperation']) {
    const {shape, transform} = operation;

    if (!shape) {
      return transform;
    }

    const boundingRectangle = this.boundingRectangle.value;

    if (!boundingRectangle) {
      return transform;
    }

    const {initial, current} = shape;
    const {height, width} = current.boundingRectangle;
    const left = initial.center.x - width / 2;
    const top = initial.center.y - height / 2;

    const restrictedTransform = restrictShapeToBoundingRectangle(
      new Rectangle(left, top, width, height),
      transform,
      boundingRectangle
    );

    return restrictedTransform;
  }

  static configure = configurator(RestrictToElement);
}
