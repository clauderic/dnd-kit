import {reactive} from '@dnd-kit/state';
import type {Type} from '@dnd-kit/types';

import {Node} from '../node';
import type {NodeInput, Data} from '../node';

export interface Input<T extends Data = Data> extends NodeInput<T> {
  type?: Type;
}

export class Draggable<T extends Data = Data> extends Node<T> {
  constructor({type, ...input}: Input<T>) {
    super(input);

    this.type = type;
  }

  @reactive
  public type: Type | undefined;
}
