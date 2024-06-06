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

export class DragDropRegistry<
  T extends Draggable,
  U extends Droppable,
  V extends DragDropManager<T, U>,
> {
  constructor(manager: V) {
    this.plugins = new PluginRegistry<V, PluginConstructor<V>>(manager);
    this.sensors = new PluginRegistry<V, SensorConstructor<V>>(manager);
    this.modifiers = new PluginRegistry<V, ModifierConstructor<V>>(manager);
  }

  public draggables = new EntityRegistry<T>();
  public droppables = new EntityRegistry<U>();
  public plugins: PluginRegistry<V, PluginConstructor<V>>;
  public sensors: PluginRegistry<V, SensorConstructor<V>>;
  public modifiers: PluginRegistry<V, ModifierConstructor<V>>;

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

  destroy() {
    this.draggables.destroy();
    this.droppables.destroy();
    this.plugins.destroy();
    this.sensors.destroy();
    this.modifiers.destroy();
  }
}
