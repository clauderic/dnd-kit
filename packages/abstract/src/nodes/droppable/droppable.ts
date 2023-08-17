import {derived, reactive} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Node} from '../node';
import type {NodeInput, Data, Type} from '../node';

import type {CollisionDetector} from '../../collision';
import type {DragDropManager} from '../../manager';

export interface Input<T extends Data = Data> extends NodeInput<T> {
  accept?: Type[];
  collisionDetector: CollisionDetector;
}

export class Droppable<T extends Data = Data> extends Node<T> {
  constructor(
    input: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);

    this.collisionDetector = input.collisionDetector;
  }

  /**
   * An array of types that are compatible with the droppable.
   */
  @reactive
  public accept: Type[] | undefined;

  /**
   * Checks whether or not the droppable accepts a given type.
   *
   * @param {Type|Type[]} types
   * @returns {boolean}
   */
  public accepts(types: Type | Type[]): boolean {
    const {accept} = this;

    if (!accept) {
      return true;
    }

    if (Array.isArray(types)) {
      return types.some((type) => accept.includes(type));
    }

    return accept.includes(types);
  }

  @reactive
  public collisionDetector: CollisionDetector;

  @reactive
  public shape: Shape | undefined;

  @derived
  public get isDropTarget() {
    return this.manager.dragOperation.target?.id === this.id;
  }

  public refreshShape() {
    // To be implemented by subclasses
  }
}
