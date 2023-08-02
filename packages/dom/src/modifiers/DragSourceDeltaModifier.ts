import {Modifier} from '@dnd-kit/abstract';
import type {BoundingRectangle} from '@dnd-kit/geometry';
import {derived, effect, reactive} from '@dnd-kit/state';

import {DragDropManager} from '../manager';
import {DOMRectangle} from '../shapes';

export class DragSourceDeltaModifier extends Modifier<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    this.destroy = effect(() => {
      const {source, initialized} = manager.dragOperation;

      if (initialized) {
        if (source?.element) {
          const {boundingRectangle} = new DOMRectangle(source.element);

          if (!this.initialBoundingRectangle) {
            this.initialBoundingRectangle = boundingRectangle;
          }

          this.currentBoundingRectangle = boundingRectangle;
        }
      } else {
        this.initialBoundingRectangle = null;
        this.currentBoundingRectangle = null;
      }
    });
  }

  @reactive
  private initialBoundingRectangle: BoundingRectangle | null = null;

  @reactive
  private currentBoundingRectangle: BoundingRectangle | null = null;

  @derived
  private get boundingRectangleDelta() {
    if (!this.initialBoundingRectangle || !this.currentBoundingRectangle) {
      return null;
    }

    return {
      top:
        this.currentBoundingRectangle.top - this.initialBoundingRectangle.top,
      left:
        this.currentBoundingRectangle.left - this.initialBoundingRectangle.left,
    };
  }

  public apply({transform}: DragDropManager['dragOperation']) {
    const {boundingRectangleDelta} = this;

    if (!boundingRectangleDelta) {
      return transform;
    }

    return {
      x: transform.x - boundingRectangleDelta.left,
      y: transform.y - boundingRectangleDelta.top,
    };
  }
}
