import type {Draggable, Droppable} from '../nodes';
import {CollisionObserver, CollisionNotifier} from '../collision';

import {DragDropRegistry} from './registry';
import {
  DragOperationManager,
  type DragOperation,
  type DragActions,
} from './dragOperation';
import {DragDropMonitor} from './monitor';
import {
  PluginRegistry,
  descriptor,
  type Plugins,
  PluginConstructor,
} from '../plugins';
import type {SensorConstructor, Sensors} from '../sensors';
import type {ModifierConstructor} from '../modifiers';

export interface DragDropConfiguration<T extends DragDropManager> {
  plugins: Plugins<T>;
  sensors: Sensors<T>;
  modifiers: ModifierConstructor<T>[];
}

export type DragDropManagerInput<T extends DragDropManager<any, any>> = Partial<
  DragDropConfiguration<T>
>;

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  public actions: DragActions<T, U, DragDropManager<T, U>>;
  public collisionObserver: CollisionObserver<T, U>;
  public dragOperation: DragOperation<T, U>;
  public registry: DragDropRegistry<T, U>;
  public monitor: DragDropMonitor<T, U, DragDropManager<T, U>>;
  public plugins: PluginRegistry<
    DragDropManager<T, U>,
    PluginConstructor<DragDropManager<T, U>>
  >;
  public sensors: PluginRegistry<
    DragDropManager<T, U>,
    SensorConstructor<DragDropManager<T, U>>
  >;
  public modifiers: PluginRegistry<
    DragDropManager<T, U>,
    ModifierConstructor<DragDropManager<T, U>>
  >;

  constructor(config?: DragDropManagerInput<any>) {
    type V = DragDropManager<T, U>;

    const {sensors = [], modifiers = []} = config ?? {};
    const plugins = [CollisionNotifier, ...(config?.plugins ?? [])];
    const monitor = new DragDropMonitor<T, U, V>(this);
    const registry = new DragDropRegistry<T, U>();

    this.registry = registry;
    this.monitor = monitor;
    this.plugins = new PluginRegistry<V, PluginConstructor<V>>(this);
    this.sensors = new PluginRegistry<V, SensorConstructor<V>>(this);
    this.modifiers = new PluginRegistry<V, ModifierConstructor<V>>(this);

    const {actions, operation} = DragOperationManager<T, U, V>(this);

    this.actions = actions;
    this.dragOperation = operation;
    this.collisionObserver = new CollisionObserver<T, U, V>(this);

    for (const modifier of modifiers) {
      this.modifiers.register(modifier);
    }

    for (const entry of plugins) {
      const {plugin, options} = descriptor(entry);
      this.plugins.register(plugin as PluginConstructor<V>, options);
    }

    for (const entry of sensors) {
      const {plugin, options} = descriptor(entry);
      this.sensors.register(plugin, options);
    }
  }

  public destroy() {
    this.plugins.destroy();
  }
}
