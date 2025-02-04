import {CleanupFunction, reactive, type Effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';
import type {Data, UniqueIdentifier} from './types.ts';

export interface Input<T extends Data = Data> {
  /**
   * The unique identifier of the entity.
   */
  id: UniqueIdentifier;
  /**
   * Optional data associated with the entity.
   */
  data?: T;
  /**
   * Whether the entity should initially be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the entity should be automatically registered with the manager when it is created.
   * @default true
   */
  register?: boolean;
  /**
   * An array of effects that are set up when the entity is registered and cleaned up when it is unregistered.
   */
  effects?(): Effect[];
}

/**
 * The `Entity` class is an abstract representation of a distinct unit in the drag and drop system.
 * It is a base class that other concrete classes like `Draggable` and `Droppable` can extend.
 *
 * @template T - The type of data associated with the entity.
 */
export class Entity<
  T extends Data = Data,
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  /**
   * Creates a new instance of the `Entity` class.
   *
   * @param input - An object containing the initial properties of the entity.
   * @param manager - The manager that controls the drag and drop operations.
   */
  constructor(input: Input<T>, manager: U | undefined) {
    const {effects, id, data = {}, disabled = false, register = true} = input;

    let previousId = id;

    this.manager = manager;
    this.id = id;
    this.data = data;
    this.disabled = disabled;
    this.effects = () => [
      () => {
        // Re-run this effect whenever the `id` changes
        const {id, manager} = this;

        if (id === previousId) {
          return;
        }

        manager?.registry.register(this);

        return () => manager?.registry.unregister(this);
      },
      ...(effects?.() ?? []),
    ];

    this.register = this.register.bind(this);
    this.unregister = this.unregister.bind(this);
    this.destroy = this.destroy.bind(this);

    if (manager && register) {
      queueMicrotask(this.register);
    }
  }

  /**
   * The manager that controls the drag and drop operations.
   */
  @reactive
  public accessor manager: U | undefined;

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
   * A method that registers the entity with the manager.
   * @returns CleanupFunction | void
   */
  public register(): CleanupFunction | void {
    return this.manager?.registry.register(this);
  }

  /**
   * A method that unregisters the entity from the manager.
   * @returns void
   */
  public unregister(): void {
    this.manager?.registry.unregister(this);
  }

  /**
   * A method that cleans up the entity when it is no longer needed.
   * @returns void
   */
  public destroy(): void {
    this.manager?.registry.unregister(this);
  }
}
