import type {Type} from '@dnd-kit/types';
import {reactive} from '@dnd-kit/state';

import {Node} from '../node';
import type {NodeInput, Data} from '../node';

import {CollisionDetector} from '../../collision';

export interface Input<T extends Data = Data> extends NodeInput<T> {
  accepts?: Type[];
  collisionDetector: CollisionDetector;
}

export interface Droppable<T extends Data = Data> extends Node<T> {
  accepts?: Type[];
  collisionDetector: CollisionDetector;
}

export class Droppable<T extends Data = Data> extends Node<T> {
  constructor({accepts, collisionDetector, ...input}: Input<T>) {
    super(input);

    this.accepts = accepts;
    this.collisionDetector = collisionDetector;
  }

  @reactive
  public collisionDetector: CollisionDetector;

  @reactive
  public accepts?: Type[];

  public compatibleWith(types: Type | Type[]): boolean {
    const {accepts} = this;

    if (!accepts) {
      return true;
    }

    if (Array.isArray(types)) {
      return types.some((type) => accepts.includes(type));
    }

    return accepts.includes(types);
  }
}
