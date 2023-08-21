import {derived, reactive} from '@dnd-kit/state';

import {Node} from '../node/index.js';
import {Modifier} from '../../modifiers/index.js';
import type {Modifiers} from '../../modifiers/index.js';
import type {DragDropManager} from '../../manager/index.js';
import type {NodeInput, Data, Type} from '../node/index.js';
import {descriptor} from '../../plugins/index.js';

export interface Input<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
> extends NodeInput<T, U> {
  type?: Type;
  modifiers?: Modifiers;
}

export class Draggable<T extends Data = Data> extends Node<T> {
  constructor(
    {modifiers, ...input}: Input<T>,
    public manager: DragDropManager
  ) {
    super(input, manager);

    if (modifiers?.length) {
      this.modifiers = modifiers.map((modifier) => {
        const {plugin, options} = descriptor(modifier);

        return new plugin(manager, options);
      });
    }
  }

  public modifiers: Modifier[] | undefined;

  @reactive
  public type: Type | undefined;

  @derived
  public get isDragSource() {
    const {dragOperation} = this.manager;

    return dragOperation.source?.id === this.id;
  }
}
