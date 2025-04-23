import type {CleanupFunction} from '@dnd-kit/state';

import {
  Draggable,
  Droppable,
  Entity,
  EntityRegistry,
} from '../entities/index.ts';
import {
  PluginRegistry,
  Plugin,
  type PluginConstructor,
  PluginOptions,
} from '../plugins/index.ts';
import {
  Sensor,
  SensorOptions,
  type SensorConstructor,
} from '../sensors/index.ts';
import {Modifier, type ModifierConstructor} from '../modifiers/index.ts';
import type {DragDropManager} from './manager.ts';

/**
 * Manages the registration and lifecycle of draggable and droppable entities,
 * as well as plugins, sensors, and modifiers.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 * @template V - The type of drag and drop manager
 */
export class DragDropRegistry<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> {
  /**
   * Creates a new registry instance.
   *
   * @param manager - The drag and drop manager that owns this registry
   */
  constructor(manager: V) {
    this.plugins = new PluginRegistry<V, PluginConstructor<V>>(manager);
    this.sensors = new PluginRegistry<V, SensorConstructor<V>>(manager);
    this.modifiers = new PluginRegistry<V, ModifierConstructor<V>>(manager);
  }

  /** Registry for draggable entities */
  public draggables = new EntityRegistry<T>();

  /** Registry for droppable entities */
  public droppables = new EntityRegistry<U>();

  /** Registry for plugins */
  public plugins: PluginRegistry<V, PluginConstructor<V>>;

  /** Registry for sensors */
  public sensors: PluginRegistry<V, SensorConstructor<V>>;

  /** Registry for modifiers */
  public modifiers: PluginRegistry<V, ModifierConstructor<V>>;

  /**
   * Registers a new entity, plugin, sensor, or modifier.
   *
   * @param input - The entity, plugin constructor, sensor constructor, or modifier constructor to register
   * @param options - Optional configuration for plugins and sensors
   * @returns A cleanup function or the registered instance
   * @throws {Error} If the input type is invalid
   */
  public register(input: Entity): () => void;
  public register(input: Draggable): () => void;
  public register(input: Droppable): () => void;
  public register(input: SensorConstructor, options?: SensorOptions): Sensor;
  public register(input: ModifierConstructor): Modifier;
  public register(input: PluginConstructor, options?: PluginOptions): Plugin;
  public register(input: any, options?: Record<string, any>) {
    if (input instanceof Draggable) {
      return this.draggables.register(input.id, input as T);
    }

    if (input instanceof Droppable) {
      return this.droppables.register(input.id, input as U);
    }

    if (input.prototype instanceof Modifier) {
      return this.modifiers.register(input, options);
    }

    if (input.prototype instanceof Sensor) {
      return this.sensors.register(input, options);
    }

    if (input.prototype instanceof Plugin) {
      return this.plugins.register(input, options);
    }

    throw new Error('Invalid instance type');
  }

  /**
   * Unregisters an entity, plugin, sensor, or modifier.
   *
   * @param input - The entity, plugin constructor, sensor constructor, or modifier constructor to unregister
   * @returns A cleanup function
   * @throws {Error} If the input type is invalid
   */
  public unregister(input: Entity): CleanupFunction;
  public unregister(input: Draggable): CleanupFunction;
  public unregister(input: Droppable): CleanupFunction;
  public unregister(input: SensorConstructor): CleanupFunction;
  public unregister(input: ModifierConstructor): CleanupFunction;
  public unregister(input: PluginConstructor): CleanupFunction;
  public unregister(input: any) {
    if (input instanceof Entity) {
      if (input instanceof Draggable) {
        return this.draggables.unregister(input.id, input as T);
      }

      if (input instanceof Droppable) {
        return this.droppables.unregister(input.id, input as U);
      }

      // no-op
      return () => {};
    }

    if (input.prototype instanceof Modifier) {
      return this.modifiers.unregister(input);
    }

    if (input.prototype instanceof Sensor) {
      return this.sensors.unregister(input);
    }

    if (input.prototype instanceof Plugin) {
      return this.plugins.unregister(input);
    }

    throw new Error('Invalid instance type');
  }

  /**
   * Destroys all registered entities and cleans up resources.
   *
   * @remarks
   * This method:
   * - Destroys all draggable and droppable entities
   * - Destroys all plugins, sensors, and modifiers
   * - Cleans up any associated resources
   */
  destroy() {
    this.draggables.destroy();
    this.droppables.destroy();
    this.plugins.destroy();
    this.sensors.destroy();
    this.modifiers.destroy();
  }
}
