import {effects, reactive, type Effect} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.js';
import type {Data, UniqueIdentifier} from './types.js';

export interface Input<T extends Data = Data, U extends Entity<T> = Entity<T>> {
  id: UniqueIdentifier;
  data?: T | null;
  disabled?: boolean;
  effects?: <Instance extends U>(instance: Instance) => Effect[];
}

/**
 * The `Entity` class is an abstract representation of a distinct unit in the drag and drop system.
 * It is a base class that other concrete classes like `Draggable` and `Droppable` can extend.
 *
 * @template T - The type of data associated with the entity.
 */
export class Entity<T extends Data = Data> {
  /**
   * Creates a new instance of the `Entity` class.
   *
   * @param input - An object containing the initial properties of the entity.
   * @param manager - The manager that controls the drag and drop operations.
   */
  constructor(
    input: Input<T>,
    public manager: DragDropManager
  ) {
    const {effects: getInputEffects, id, data = null, disabled = false} = input;

    this.id = id;
    this.data = data;
    this.disabled = disabled;

    // Make sure all input properties are set on the instance before registering it
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      this[key as keyof this] = value;
    }

    const inputEffects = getInputEffects?.(this) ?? [];

    this.destroy = effects(
      () => {
        // Re-run this effect whenever the `id` changes
        const {id: _} = this;
        manager.registry.register(this);

        return () => manager.registry.unregister(this);
      },
      ...inputEffects
    );
  }

  /**
   * The unique identifier of the entity.
   */
  @reactive
  public id: UniqueIdentifier;

  /**
   * The data associated with the entity.
   */
  @reactive
  public data: Data | null;

  /**
   * A boolean indicating whether the entity is disabled.
   */
  @reactive
  public disabled: boolean;

  /**
   * A method that cleans up the entity when it is no longer needed.
   * @returns void
   */
  public destroy(): void {}
}
