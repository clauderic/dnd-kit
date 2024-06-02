import {derived, effects, reactive, type Effect} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.js';
import type {EntityInput, Data, Type} from '../entity/index.js';
import {
  CollisionPriority,
  type CollisionDetector,
} from '../../collision/index.js';
import type {DragDropManager} from '../../manager/index.js';
import {Draggable} from '../draggable/draggable.js';

export interface Input<
  T extends Data = Data,
  U extends Droppable<T> = Droppable<T>,
> extends EntityInput<T, U> {
  accept?: Type | Type[] | ((source: Draggable) => boolean);
  collisionPriority?: CollisionPriority | number;
  collisionDetector: CollisionDetector;
  type?: Type;
}

export class Droppable<T extends Data = Data> extends Entity<T> {
  constructor(
    {
      accept,
      collisionDetector,
      collisionPriority = CollisionPriority.Normal,
      type,
      ...input
    }: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);

    this.accept = accept;
    this.collisionDetector = collisionDetector;
    this.collisionPriority = collisionPriority;
    this.type = type;
  }

  /**
   * An array of types that are compatible with the droppable.
   */
  @reactive
  public accept:
    | Type
    | Type[]
    | ((draggable: Draggable) => boolean)
    | undefined;

  /**
   * The type of the droppable.
   */
  @reactive
  public type: Type | undefined;

  /**
   * Checks whether or not the droppable accepts a given draggable.
   *
   * @param {Draggable} draggable
   * @returns {boolean}
   */
  public accepts(draggable: Draggable): boolean {
    const {accept} = this;

    if (!accept) {
      return true;
    }

    if (!draggable.type) {
      return false;
    }

    if (Array.isArray(accept)) {
      return accept.includes(draggable.type);
    }

    if (typeof accept === 'function') {
      return accept(draggable);
    }

    return draggable.type === accept;
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
