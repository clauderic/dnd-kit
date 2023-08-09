import {derived, reactive} from '@dnd-kit/state';
import type {Type} from '@dnd-kit/types';

import type {DragDropManager} from '../../manager';
import {Node} from '../node';
import type {NodeInput, Data} from '../node';

export interface Input<T extends Data = Data> extends NodeInput<T> {
  type?: Type;
}

export class Draggable<T extends Data = Data> extends Node<T> {
  constructor(
    {type, ...input}: Input<T>,
    protected manager: DragDropManager
  ) {
    super(input, manager);

    this.type = type;
  }

  @reactive
  public type: Type | undefined;

  @derived
  public get isDragSource() {
    return this.manager.dragOperation.source?.id === this.id;
  }
}
