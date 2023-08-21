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
    const currentHeight = current.boundingRectangle.height;
    const currentWidth = current.boundingRectangle.width;
    const left =
      initial.boundingRectangle.left -
      (currentWidth - initial.boundingRectangle.width);
    const top =
      initial.boundingRectangle.top -
      (currentHeight - initial.boundingRectangle.height);

    const restrictedTransform = restrictShapeToBoundingRectangle(
      new Rectangle(left, top, currentWidth, currentHeight),
      transform,
      this.windowBoundingRectangle
    );

    return restrictedTransform;
  }
}
