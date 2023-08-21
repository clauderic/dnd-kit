import {effect, untracked} from '@dnd-kit/state';
import {Modifier, type DragOperation} from '@dnd-kit/abstract';
import {restrictShapeToBoundingRectangle} from '@dnd-kit/abstract/modifiers';
import {Rectangle, type BoundingRectangle} from '@dnd-kit/geometry';
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
        return;
      }

      getWindowBoundingRectangle();

      window.addEventListener('resize', getWindowBoundingRectangle);

      return () => {
        window.removeEventListener('resize', getWindowBoundingRectangle);
      };
    });
  }

  windowBoundingRectangle: BoundingRectangle | undefined;

  apply({shape, transform}: DragOperation) {
    if (!this.windowBoundingRectangle || !shape) {
      return transform;
    }

    const {initial, current} = shape;
    const {height, width} = current.boundingRectangle;
    const left = initial.center.x - width / 2;
    const top = initial.center.y - height / 2;

    const restrictedTransform = restrictShapeToBoundingRectangle(
      new Rectangle(left, top, width, height),
      transform,
      this.windowBoundingRectangle
    );

    return restrictedTransform;
  }
}
