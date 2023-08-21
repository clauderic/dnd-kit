import {derived, effect, reactive} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.js';
import {Node} from '../node/index.js';
import type {NodeInput, Data, Type} from '../node/index.js';
import type {Modifiers} from '../../modifiers/index.js';

export interface Input<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
> extends NodeInput<T, U> {
  type?: Type;
}

export class Draggable<T extends Data = Data> extends Node<T> {
  constructor(
    input: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);
  }

  @reactive
  public type: Type | undefined;

  @derived
  public get isDragSource() {
    const {dragOperation} = this.manager;

    return dragOperation.source?.id === this.id;
  }
}
