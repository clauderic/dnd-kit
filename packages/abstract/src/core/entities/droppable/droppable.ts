import {derived, effects, reactive, type Effect} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.js';
import type {EntityInput, Data, Type} from '../entity/index.js';
import {
  CollisionPriority,
  type CollisionDetector,
} from '../../collision/index.js';
import type {DragDropManager} from '../../manager/index.js';

export interface Input<
  T extends Data = Data,
  U extends Droppable<T> = Droppable<T>,
> extends EntityInput<T, U> {
  accept?: Type | Type[];
  collisionPriority?: CollisionPriority | number;
  collisionDetector: CollisionDetector;
  type?: Type;
}

export class Droppable<T extends Data = Data> extends Entity<T> {
  constructor(
    {
      collisionDetector,
      collisionPriority = CollisionPriority.Normal,
      ...input
    }: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);
    const {destroy} = this;

    this.collisionDetector = collisionDetector;
    this.collisionPriority = collisionPriority;

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
  public collisionPriority: number;

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
