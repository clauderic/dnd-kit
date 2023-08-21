import {effect, effects, reactive, type Effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.js';
import type {Data, UniqueIdentifier} from './types.js';

export interface Input<T extends Data = Data, U extends Node<T> = Node<T>> {
  id: UniqueIdentifier;
  data?: T | null;
  disabled?: boolean;
  effects?: <Instance extends U>(instance: Instance) => Effect[];
}

export class Node<T extends Data = Data> {
  constructor(
    input: Input<T>,
    public manager: DragDropManager
  ) {
    const {effects: inputEffects, id, data = null, disabled = false} = input;

    this.id = id;
    this.data = data;
    this.disabled = disabled;

    // Make sure all properties are set before registering the node
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      this[key as keyof this] = value;
    }

    this.destroy = effects(
      () => {
        // Re-run this effect whenever the `id` changes
        const {id: _} = this;
        manager.registry.register(this);

        return () => manager.registry.unregister(this);
      },
      ...(inputEffects?.(this) ?? [])
    );
  }

  @reactive
  public id: UniqueIdentifier;

  @reactive
  public data: Data | null;

  @reactive
  public disabled: boolean;

  public destroy() {}
}
