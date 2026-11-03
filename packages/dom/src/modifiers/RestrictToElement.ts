import {Modifier, configurator} from '@dnd-kit/abstract';
import {restrictShapeToBoundingRectangle} from '@dnd-kit/abstract/modifiers';
import {BoundingRectangle, Rectangle} from '@dnd-kit/geometry';
import {effect, signal} from '@dnd-kit/state';
import type {Coordinates} from '@dnd-kit/geometry';
import type {DragDropManager} from '@dnd-kit/dom';
import {getBoundingRectangle} from '@dnd-kit/dom/utilities';

interface Options {
  element?:
    | Element
    | null
    | ((operation: DragDropManager['dragOperation']) => Element | null);
}

export class RestrictToElement extends Modifier<DragDropManager, Options> {
  private boundingRectangle = signal<BoundingRectangle | null>(null);
  private previousConstrainedTransform: Coordinates = {x: 0, y: 0};

  constructor(manager: DragDropManager, options?: Options) {
    super(manager, options);

    this.destroy = effect(() => {
      if (!this.options) {
        return;
      }

      const {dragOperation} = manager;
      const {status} = dragOperation;

      if (status.initialized) {
        this.previousConstrainedTransform = {x: 0, y: 0};

        const {element} = this.options;
        const target =
          typeof element === 'function' ? element(dragOperation) : element;

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

    const {current} = shape;
    const {left, top, width, height} = current.boundingRectangle;

    const baseLeft = left - this.previousConstrainedTransform.x;
    const baseTop = top - this.previousConstrainedTransform.y;

    const restrictedTransform = restrictShapeToBoundingRectangle(
      new Rectangle(baseLeft, baseTop, width, height),
      transform,
      boundingRectangle
    );

    this.previousConstrainedTransform = restrictedTransform;
    return restrictedTransform;
  }

  static configure = configurator(RestrictToElement);
}
