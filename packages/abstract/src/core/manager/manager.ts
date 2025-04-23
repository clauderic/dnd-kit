import {effects, untracked} from '@dnd-kit/state';

import type {Draggable, Droppable} from '../entities/index.ts';
import {CollisionObserver, CollisionNotifier} from '../collision/index.ts';
import type {Plugins, Plugin} from '../plugins/index.ts';
import type {Sensor, Sensors} from '../sensors/index.ts';
import type {Modifier, Modifiers} from '../modifiers/index.ts';
import {descriptor} from '../plugins/utilities.ts';

import {DragActions} from './actions.ts';
import {DragDropRegistry} from './registry.ts';
import {DragOperation} from './operation.ts';
import {DragDropMonitor} from './events.ts';
import {defaultRenderer, type Renderer} from './renderer.ts';

export type DragDropManagerInput<T extends DragDropManager<any, any>> = {
  plugins?: Plugins<T>;
  sensors?: Sensors<T>;
  modifiers?: Modifiers<T>;
  renderer?: Renderer;
};

/**
 * Central manager class that orchestrates drag and drop operations.
 *
 * @template T - The type of draggable entities
 * @template U - The type of droppable entities
 */
export class DragDropManager<T extends Draggable, U extends Droppable> {
  /** Actions that can be performed during drag operations */
  public actions: DragActions<T, U, DragDropManager<T, U>>;

  /** Observes and manages collision detection between draggable and droppable entities */
  public collisionObserver: CollisionObserver<T, U>;

  /** Tracks the current drag operation state and metadata */
  public dragOperation: DragOperation<T, U>;

  /** Monitors and emits drag and drop events */
  public monitor: DragDropMonitor<T, U, DragDropManager<T, U>>;

  /** Registry that manages draggable and droppable entities */
  public registry: DragDropRegistry<T, U, DragDropManager<T, U>>;

  /** Handles rendering of drag and drop visual feedback */
  public renderer: Renderer;

  /**
   * Creates a new drag and drop manager instance.
   *
   * @param config - Optional configuration for plugins, sensors, modifiers, and renderer
   */
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

    this.actions = new DragActions<T, U, V>(this);
    this.dragOperation = new DragOperation<T, U>(this);
    this.collisionObserver = new CollisionObserver<T, U, V>(this);
    this.plugins = [CollisionNotifier, ...plugins];
    this.modifiers = modifiers;
    this.sensors = sensors;

    const {destroy} = this;

    const cleanup = effects(() => {
      const currentModifiers = untracked(() => this.dragOperation.modifiers);
      const managerModifiers = this.modifiers;

      if (currentModifiers !== managerModifiers) {
        currentModifiers.forEach((modifier) => modifier.destroy());
      }

      this.dragOperation.modifiers =
        this.dragOperation.source?.modifiers?.map((modifier) => {
          const {plugin, options} = descriptor(modifier);
          return new plugin(this, options);
        }) ?? managerModifiers;
    });

    this.destroy = () => {
      cleanup();
      destroy();
    };
  }

  /**
   * Gets the list of active plugins.
   *
   * @returns Array of active plugin instances
   */
  get plugins(): Plugin<any>[] {
    return this.registry.plugins.values;
  }

  /**
   * Sets the list of plugins to be used by the manager.
   *
   * @param plugins - Array of plugin constructors or instances
   */
  set plugins(plugins: Plugins<any>) {
    this.registry.plugins.values = plugins;
  }

  /**
   * Gets the list of active modifiers.
   *
   * @returns Array of active modifier instances
   */
  get modifiers(): Modifier<any>[] {
    return this.registry.modifiers.values;
  }

  /**
   * Sets the list of modifiers to be used by the manager.
   *
   * @param modifiers - Array of modifier constructors or instances
   */
  set modifiers(modifiers: Modifiers<any>) {
    this.registry.modifiers.values = modifiers;
  }

  /**
   * Gets the list of active sensors.
   *
   * @returns Array of active sensor instances
   */
  get sensors(): Sensor<any>[] {
    return this.registry.sensors.values;
  }

  /**
   * Sets the list of sensors to be used by the manager.
   *
   * @param sensors - Array of sensor constructors or instances
   */
  set sensors(sensors: Sensors<any>) {
    this.registry.sensors.values = sensors;
  }

  /**
   * Cleans up resources and stops any active drag operations.
   */
  public destroy = () => {
    if (!this.dragOperation.status.idle) {
      this.actions.stop({canceled: true});
    }

    this.dragOperation.modifiers.forEach((modifier) => modifier.destroy());

    this.registry.destroy();
    this.collisionObserver.destroy();
  };
}
