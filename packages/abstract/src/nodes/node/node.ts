import {effect, reactive} from '@dnd-kit/state';
import type {CleanupFunction, UniqueIdentifier} from '@dnd-kit/types';

import type {DragDropManager} from '../../manager';
import type {Data} from './types';

export interface Input<T extends Data = Data> {
  id: UniqueIdentifier;
  data?: T | null;
  disabled?: boolean;
}

export class Node<T extends Data = Data> {
  constructor(
    input: Input<T>,
    protected manager: DragDropManager
  ) {
    const {id, data = null, disabled = false} = input;

    this.id = id;
    this.data = data;
    this.disabled = disabled;

    this.destroy = effect(() => {
      // Re-run this effect whenever the `id` changes
      const {id: _} = this;
      const unregister = manager.registry.register(this);

      return unregister;
    });
  }

  @reactive
  public id: UniqueIdentifier;

  @reactive
  public data: Data | null;

  @reactive
  public disabled: boolean;

  public destroy: CleanupFunction;
}
