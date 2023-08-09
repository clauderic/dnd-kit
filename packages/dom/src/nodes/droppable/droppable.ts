import {Droppable as AbstractDroppable} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
  DragDropManager as AbstractDragDropManager,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {effect, reactive} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {DOMRectangle} from '../../shapes';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
  element?: Element;
  ignoreTransform?: boolean;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<T> {
  @reactive
  public element: Element | undefined;

  @reactive
  public ignoreTransform: boolean;

  constructor(
    {
      collisionDetector = defaultCollisionDetection,
      element,
      ignoreTransform = false,
      ...input
    }: Input<T>,
    protected manager: AbstractDragDropManager<any, any>
  ) {
    super({...input, collisionDetector}, manager);

    this.element = element;
    this.ignoreTransform = ignoreTransform;
    this.updateShape = this.updateShape.bind(this);
    this.destroy = effect(this.updateShape);
  }

  public updateShape(): Shape | null {
    const {disabled, element} = this;

    if (!element || disabled) {
      this.shape = null;
      return null;
    }

    const {shape} = this;
    const updatedShape = new DOMRectangle(element, this.ignoreTransform);

    if (shape?.equals(updatedShape)) {
      return shape;
    }

    this.shape = updatedShape;

    return updatedShape;
  }
}
