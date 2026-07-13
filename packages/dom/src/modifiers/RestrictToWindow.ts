import {effect, untracked} from '@dnd-kit/state';
import {Modifier, type DragOperation} from '@dnd-kit/abstract';
import {restrictShapeToBoundingRectangle} from '@dnd-kit/abstract/modifiers';
import {Rectangle, type BoundingRectangle, type Coordinates} from '@dnd-kit/geometry';
import type {DragDropManager} from '@dnd-kit/dom';
import {getViewportBoundingRectangle} from '@dnd-kit/dom/utilities';

export class RestrictToWindow extends Modifier<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    const {dragOperation} = manager;

    const getWindowBoundingRectangle = () =>
      untracked(() => {
        const {source} = dragOperation;
        this.windowBoundingRectangle = getViewportBoundingRectangle(
          source?.element ?? document.documentElement
        );
      });

    this.destroy = effect(() => {
      if (dragOperation.status.idle) {
        this.previousConstrainedTransform = {x: 0, y: 0};
        return;
      }

      this.previousConstrainedTransform = {x: 0, y: 0};
      getWindowBoundingRectangle();

      window.addEventListener('resize', getWindowBoundingRectangle);

      return () => {
        window.removeEventListener('resize', getWindowBoundingRectangle);
      };
    });
  }

  windowBoundingRectangle: BoundingRectangle | undefined;
  private previousConstrainedTransform: Coordinates = {x: 0, y: 0};

  apply({shape, transform}: DragOperation) {
    if (!this.windowBoundingRectangle || !shape) {
      return transform;
    }

    const {current} = shape;
    const {left, top, width, height} = current.boundingRectangle;

    const baseLeft = left - this.previousConstrainedTransform.x;
    const baseTop = top - this.previousConstrainedTransform.y;

    const restrictedTransform = restrictShapeToBoundingRectangle(
      new Rectangle(baseLeft, baseTop, width, height),
      transform,
      this.windowBoundingRectangle
    );

    this.previousConstrainedTransform = restrictedTransform;
    return restrictedTransform;
  }
}
