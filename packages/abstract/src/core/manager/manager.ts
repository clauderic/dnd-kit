import type {Draggable, Droppable} from '../entities/index.js';
import {CollisionObserver, CollisionNotifier} from '../collision/index.js';
import type {Plugins, Plugin} from '../plugins/index.js';
import type {Sensor, Sensors} from '../sensors/index.js';
import type {Modifier, Modifiers} from '../modifiers/index.js';

import {DragDropRegistry} from './registry.js';
import {
  DragOperationManager,
  type DragOperation,
  type DragActions,
} from './dragOperation.js';
import {DragDropMonitor} from './events.js';
import {defaultRenderer, type Renderer} from './renderer.js';

export interface DragDropConfiguration<T extends DragDropManager> {
  core?: {
    plugins: Plugins<T>;
  };
  plugins: Plugins<T>;
  sensors: Sensors<T>;
  modifiers: Modifiers<T>;
  renderer: Renderer;
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
  public monitor: DragDropMonitor<T, U, DragDropManager<T, U>>;
  public registry: DragDropRegistry<T, U, DragDropManager<T, U>>;
  public renderer: Renderer;

  constructor(config?: DragDropManagerInput<any>) {
    type V = DragDropManager<T, U>;

    const {
      plugins = [],
      sensors = [],
      modifiers = [],
      renderer = defaultRenderer,
    } = config ?? {};
    const monitor = new DragDropMonitor<T, U, V>(this);
    const registry = new DragDropRegistry<T, U, V>(this);

    this.registry = registry;
    this.monitor = monitor;
    this.renderer = renderer;

    const {actions, operation} = DragOperationManager<T, U, V>(this);

    this.actions = actions;
    this.dragOperation = operation;
    this.collisionObserver = new CollisionObserver<T, U, V>(this);
    this.plugins = [CollisionNotifier, ...plugins];
    this.modifiers = modifiers;
    this.sensors = sensors;
  }

  get plugins(): Plugin<any>[] {
    return this.registry.plugins.values;
  }

  set plugins(plugins: Plugins<any>) {
    this.registry.plugins.values = plugins;
  }

  get modifiers(): Modifier<any>[] {
    return this.registry.modifiers.values;
  }

  set modifiers(modifiers: Modifiers<any>) {
    this.registry.modifiers.values = modifiers;
  }

  get sensors(): Sensor<any>[] {
    return this.registry.sensors.values;
  }

  set sensors(sensors: Sensors<any>) {
    this.registry.sensors.values = sensors;
  }

  public destroy() {
    this.registry.destroy();
    this.collisionObserver.destroy();
  }
}
