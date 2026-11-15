import {effects, signal} from '@dnd-kit/state';

import type {Entity} from './entity.ts';
import type {UniqueIdentifier} from './types.ts';

/**
 * Reactive class representing a registry for entities.
 * @template T - The type of entries that the registry manages,
 * for example, `Draggable` or `Droppable` entities.
 */
export class EntityRegistry<T extends Entity> {
  private map = new Map<UniqueIdentifier, T>();
  private version = signal(0);
  private keys = new WeakMap<T, UniqueIdentifier>();
  private snapshot: T[] | undefined;
  private cleanupFunctions = new WeakMap<T, () => void>();

  private entries(): T[] {
    return (this.snapshot ??= Array.from(this.map.values()));
  }

  private changed() {
    this.snapshot = undefined;
    this.version.value = this.version.peek() + 1;
  }

  /**
   * Iterator for the EntityRegistry class.
   * @returns An iterator for the values in the map.
   */
  public [Symbol.iterator]() {
    return this.entries().values();
  }

  public get value() {
    this.version.value;
    return this.entries().values();
  }

  /**
   * Checks if a entity with the given identifier exists in the registry.
   * @param identifier - The unique identifier of the entity.
   * @returns True if the entity exists, false otherwise.
   */
  public has(identifier: UniqueIdentifier): boolean {
    this.version.value;
    return this.map.has(identifier);
  }

  /**
   * Retrieves a entity from the registry using its identifier.
   * @param identifier - The unique identifier of the entity.
   * @returns The entity if it exists, undefined otherwise.
   */
  public get(identifier: UniqueIdentifier): T | undefined {
    this.version.value;
    return this.map.get(identifier);
  }

  /**
   * Registers a entity in the registry.
   * @param key - The unique identifier of the entity.
   * @param value - The entity to register.
   * @returns A function that unregisters the entity.
   */
  public register = (key: UniqueIdentifier, value: T) => {
    const currentValue = this.map.get(key);
    const unregister = () => this.unregister(key, value);

    if (currentValue === value) return unregister;

    if (currentValue) {
      if (currentValue.id === key) {
        const cleanup = this.cleanupFunctions.get(currentValue);
        cleanup?.();
        this.cleanupFunctions.delete(currentValue);
      }
    }

    // Remove ghost registrations: if this entity exists at a different key
    // (stale entry from before its id changed), clean it up
    const existingKey = this.keys.get(value);

    if (
      existingKey !== undefined &&
      existingKey !== key &&
      this.map.get(existingKey) === value
    ) {
      this.map.delete(existingKey);
    }

    this.map.set(key, value);
    this.keys.set(value, key);
    this.changed();

    const cleanup = effects(...value.effects());
    this.cleanupFunctions.set(value, cleanup);

    return unregister;
  };

  /**
   * Unregisters an entity from the registry.
   * @param key - The unique identifier of the entity.
   * @param value - The entity instance to unregister.
   */
  public unregister = (key: UniqueIdentifier, value: T) => {
    if (this.map.get(key) !== value) {
      return;
    }

    const cleanup = this.cleanupFunctions.get(value);
    cleanup?.();
    this.cleanupFunctions.delete(value);

    this.map.delete(key);
    this.keys.delete(value);
    this.changed();
  };

  /**
   * Destroys all entries in the registry and clears the registry.
   */
  public destroy() {
    for (const entry of this) {
      const cleanup = this.cleanupFunctions.get(entry);
      cleanup?.();
      entry.destroy();
    }

    this.map = new Map();
    this.changed();
  }
}
