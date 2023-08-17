import {effect, reactive} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import type {Data, UniqueIdentifier} from './types';

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

    // Make sure all properties are set before registering the node
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      this[key as keyof this] = value;
    }

    this.destroy = effect(() => {
      // Re-run this effect whenever the `id` changes
      const {id: _} = this;
      manager.registry.register(this);

      return () => manager.registry.unregister(this);
    });
  }

  @reactive
  public id: UniqueIdentifier;

  @reactive
  public data: Data | null;

  @reactive
  public disabled: boolean;

  public destroy() {}
}
