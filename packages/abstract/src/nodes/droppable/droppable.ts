import {derived, effects, reactive, type Effect} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Node} from '../node';
import type {NodeInput, Data, Type} from '../node';

import type {CollisionDetector} from '../../collision';
import type {DragDropManager} from '../../manager';

export interface Input<
  T extends Data = Data,
  U extends Droppable<T> = Droppable<T>,
> extends NodeInput<T, U> {
  accept?: Type | Type[];
  collisionPriority?: number;
  collisionDetector: CollisionDetector;
  type?: Type;
}

export class Droppable<T extends Data = Data> extends Node<T> {
  constructor(
    {collisionDetector, ...input}: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);
    const {destroy} = this;

    this.collisionDetector = collisionDetector;

    this.destroy = () => {
      destroy();
    };
  }

  /**
   * An array of types that are compatible with the droppable.
   */
  @reactive
  public accept: Type | Type[] | undefined;

  /**
   * The type of the droppable.
   */
  @reactive
  public type: Type | undefined;

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

    const acceptedTypes = Array.isArray(accept) ? accept : [accept];

    if (Array.isArray(types)) {
      return types.some((type) => acceptedTypes.includes(type));
    }

    return acceptedTypes.includes(types);
  }

  @reactive
  public collisionDetector: CollisionDetector;

  @reactive
  public collisionPriority: number | undefined;

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
