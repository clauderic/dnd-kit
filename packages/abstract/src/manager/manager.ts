import type {Draggable, Droppable} from '../nodes';
import {CollisionObserver} from '../collision';

import {DragDropRegistry} from './registry';
import {DragOperationManager} from './dragOperation';
import type {DragOperation} from './dragOperation';
import {Monitor} from './monitor';
import {PluginRegistry, type PluginConstructor} from '../plugins';
import type {SensorConstructor} from '../sensors';

export interface DragDropConfiguration<T extends DragDropManager<any, any>> {
  plugins: PluginConstructor<T>[];
  sensors: SensorConstructor<T>[];
}

export type DragDropManagerInput<T extends DragDropManager<any, any>> = Partial<
  DragDropConfiguration<T>
>;

export type DragDropEvents = {
  dragstart: {};
  dragmove: {};
  dragend: {operation: DragOperation; canceled: boolean};
};

export class DragDropMonitor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> extends Monitor<DragDropEvents> {
  constructor(private manager: T) {
    super();
  }

  public dispatch<T extends keyof DragDropEvents>(
    type: T,
    event: DragDropEvents[T]
  ) {
    super.dispatch(type, event);
  }
}

export class DragDropManager<
  T extends Draggable = Draggable,
  U extends Droppable = Droppable,
> {
  public actions: DragOperationManager<T, U>['actions'];
  public collisionObserver: CollisionObserver<T, U>;
  public dragOperation: DragOperation<T, U>;
  public registry: DragDropRegistry<T, U>;
  public monitor: DragDropMonitor<DragDropManager<T, U>>;
  public plugins: PluginRegistry<DragDropManager<T, U>>;
  public sensors: PluginRegistry<DragDropManager<T, U>>;

  constructor(config?: DragDropManagerInput<DragDropManager<T, U>>) {
    const {plugins = [], sensors = []} = config ?? {};
    const monitor = new DragDropMonitor(this);
    const registry = new DragDropRegistry<T, U>();
    const {actions, operation} = DragOperationManager<T, U>({
      registry,
      monitor,
    });
    const collisionObserver = new CollisionObserver<T, U>({
      dragOperation: operation,
      registry,
    });

    this.actions = actions;
    this.collisionObserver = collisionObserver;
    this.registry = registry;
    this.dragOperation = operation;
    this.monitor = monitor;
    this.plugins = new PluginRegistry(this);
    this.sensors = new PluginRegistry(this);

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
