import type {Draggable, Droppable} from '../nodes';
import {CollisionObserver} from '../collision';

import {DragDropRegistry} from './registry';
import {
  DragOperationManager,
  type DragOperation,
  type DragActions,
} from './dragOperation';
import {DragDropMonitor} from './monitor';
import {PluginRegistry, type PluginConstructor} from '../plugins';
import type {Sensor, SensorConstructor} from '../sensors';
import type {Modifier, ModifierConstructor} from '../modifiers';

export interface DragDropConfiguration<T extends DragDropManager<any, any>> {
  plugins: PluginConstructor<T>[];
  sensors: SensorConstructor<T>[];
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
  public monitor: DragDropMonitor<DragDropManager<T, U>>;
  public plugins: PluginRegistry<DragDropManager<T, U>>;
  public sensors: PluginRegistry<
    DragDropManager<T, U>,
    Sensor<DragDropManager<T, U>>
  >;
  public modifiers: PluginRegistry<
    DragDropManager<T, U>,
    Modifier<DragDropManager<T, U>>
  >;

  constructor(config?: DragDropManagerInput<DragDropManager<T, U>>) {
    type V = DragDropManager<T, U>;

    const {plugins = [], sensors = [], modifiers = []} = config ?? {};
    const monitor = new DragDropMonitor<V>(this);
    const registry = new DragDropRegistry<T, U>();

    this.registry = registry;
    this.monitor = monitor;
    this.plugins = new PluginRegistry<V>(this);
    this.sensors = new PluginRegistry<V, Sensor<V>>(this);
    this.modifiers = new PluginRegistry<V, Modifier<V>>(this);

    const {actions, operation} = DragOperationManager<T, U, V>(this);
    const collisionObserver = new CollisionObserver<T, U>({
      dragOperation: operation,
      registry,
    });

    this.actions = actions;
    this.collisionObserver = collisionObserver;
    this.dragOperation = operation;

    for (const modifier of modifiers) {
      this.modifiers.register(modifier);
    }

    for (const plugin of plugins) {
      this.plugins.register(plugin);
    }

    for (const sensor of sensors) {
      this.sensors.register(sensor);
    }
  }

  public destroy() {
    this.plugins.destroy();
  }
}
