import {reactive, type Effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';
import type {Data, UniqueIdentifier} from './types.ts';

export interface Input<T extends Data = Data> {
  id: UniqueIdentifier;
  data?: T;
  disabled?: boolean;
  effects?(): Effect[];
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
  constructor(input: Input<T>, manager: DragDropManager | undefined) {
    const {effects, id, data = {}, disabled = false} = input;

    let previousId = id;

    this.manager = manager;
    this.id = id;
    this.data = data;
    this.disabled = disabled;
    this.effects = () => [
      () => {
        // Re-run this effect whenever the `id` changes
        const {id: _, manager} = this;

        if (id === previousId) {
          return;
        }

        manager?.registry.register(this);

        return () => manager?.registry.unregister(this);
      },
      ...(effects?.() ?? []),
    ];
    this.destroy = this.destroy.bind(this);

    if (manager) {
      queueMicrotask(() => {
        this.manager?.registry.register(this);
      });
    }
  }

  /**
   * The manager that controls the drag and drop operations.
   */
  @reactive
  public accessor manager: DragDropManager | undefined;

  /**
   * The unique identifier of the entity.
   */
  @reactive
  public accessor id: UniqueIdentifier;

  /**
   * The data associated with the entity.
   */
  @reactive
  public accessor data: Data;

  /**
   * A boolean indicating whether the entity is disabled.
   */
  @reactive
  public accessor disabled: boolean;

  /**
   * An array of effects that are applied to the entity.
   */
  public effects: () => Effect[];

  /**
   * A method that cleans up the entity when it is no longer needed.
   * @returns void
   */
  public destroy(): void {
    this.manager?.registry.unregister(this);
  }
}
