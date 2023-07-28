import {
  DragOperationStatus,
  Droppable as AbstractDroppable,
} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {Shape} from '@dnd-kit/geometry';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {effect, reactive} from '@dnd-kit/state';

import {DOMRectangle} from '../../shapes';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
  shape?: Shape;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<T> {
  @reactive
  public element: Element | undefined;

  constructor({
    collisionDetector = defaultCollisionDetection,
    ...input
  }: Input<T>) {
    super({...input, collisionDetector});

    this.destroy = effect(this.updateShape);
  }

  public updateShape = () => {
    const {disabled, element} = this;

    if (!element || disabled) {
      this.shape = null;
      return;
    }

    const updatedShape = new DOMRectangle(element);

    if (this.shape?.equals(updatedShape)) {
      return;
    }

    this.shape = updatedShape;
  };
}
