import {derived, effects, reactive, type Effect} from '@dnd-kit/state';
import type {Shape} from '@dnd-kit/geometry';

import {Entity} from '../entity/index.ts';
import type {EntityInput, Data, Type} from '../entity/index.ts';
import {
  CollisionPriority,
  type CollisionDetector,
} from '../../collision/index.ts';
import type {DragDropManager} from '../../manager/index.ts';
import {Draggable} from '../draggable/draggable.ts';

export interface Input<T extends Data = Data> extends EntityInput<T> {
  accept?: Type | Type[] | ((source: Draggable) => boolean);
  collisionPriority?: CollisionPriority | number;
  collisionDetector: CollisionDetector;
  type?: Type;
}

export class Droppable<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Entity<T, U> {
  constructor(
    {accept, collisionDetector, collisionPriority, type, ...input}: Input<T>,
    manager: U | undefined
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
  public accessor accept:
    | Type
    | Type[]
    | ((draggable: Draggable) => boolean)
    | undefined;

  /**
   * The type of the droppable.
   */
  @reactive
  public accessor type: Type | undefined;

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

    if (typeof accept === 'function') {
      return accept(draggable);
    }

    if (!draggable.type) {
      return false;
    }

    if (Array.isArray(accept)) {
      return accept.includes(draggable.type);
    }

    return draggable.type === accept;
  }

  @reactive
  public accessor collisionDetector: CollisionDetector;

  @reactive
  public accessor collisionPriority: CollisionPriority | number | undefined;

  @reactive
  public accessor shape: Shape | undefined;

  @derived
  public get isDropTarget() {
    return this.manager?.dragOperation.target?.id === this.id;
  }
}
