import {derived, reactive} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import {Node} from '../node';
import type {NodeInput, Data, Type} from '../node';

export interface Input<T extends Data = Data> extends NodeInput<T> {
  type?: Type;
}

export class Draggable<T extends Data = Data> extends Node<T> {
  constructor(
    {type, ...input}: Input<T>,
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
