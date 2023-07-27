import type {Draggable, Droppable} from '../nodes';
import {CollisionObserver} from '../collision';

import {DragDropRegistry} from './registry';
import {DragOperationManager} from './dragOperation';
import type {DragOperation} from './dragOperation';
import {Monitor} from './monitor';
import {Plugin, PluginConstructor} from '../plugin';
import {SensorRegistry} from '../sensors';

export interface DragDropConfiguration {
  plugins: PluginConstructor[];
}

export type DragDropManagerInput = Partial<DragDropConfiguration>;

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
  public collisionObserver: CollisionObserver;
  public dragOperation: DragOperation<T, U>;
  public plugins: Plugin[];
  public registry: DragDropRegistry<T, U>;
  public monitor: DragDropMonitor<this>;
  public sensors: SensorRegistry<this>;

  constructor(config?: DragDropManagerInput) {
    const {plugins = []} = config ?? {};
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
    this.dragOperation = operation as any;
    this.plugins = plugins.map((Plugin) => new Plugin(this));
    this.monitor = monitor;
    this.sensors = new SensorRegistry(this);
  }

  public destroy() {
    this.plugins.forEach((plugin) => plugin.destroy());
  }
}
