import {DragDropManager} from '../manager/index.ts';
import {CorePlugin, type Plugin} from './plugin.ts';
import type {
  InferPluginOptions,
  PluginDescriptor,
  PluginConstructor,
  Plugins,
} from './types.ts';
import {descriptor} from './utilities.ts';

/**
 * Manages the registration and lifecycle of plugin instances.
 *
 * @template T - The type of drag and drop manager
 * @template W - The type of plugin constructor
 * @template U - The type of plugin instance
 */
export class PluginRegistry<
  T extends DragDropManager<any, any>,
  W extends PluginConstructor<T> = PluginConstructor<T>,
  U extends Plugin<T> = InstanceType<W>,
> {
  private instances: Map<W, U> = new Map();

  /**
   * Creates a new plugin registry.
   *
   * @param manager - The drag and drop manager that owns this registry
   */
  constructor(private manager: T) {}

  /**
   * Gets all registered plugin instances.
   *
   * @returns An array of all active plugin instances
   */
  public get values(): U[] {
    return Array.from(this.instances.values());
  }

  #previousValues: PluginConstructor<T>[] = [];

  /**
   * Sets the list of plugins to be used by the registry.
   *
   * @param entries - Array of plugin constructors or descriptors
   * @remarks
   * This method:
   * - Filters out duplicate plugins
   * - Unregisters plugins that are no longer in use
   * - Registers new plugins with their options
   */
  public set values(entries: Plugins<T>) {
    const descriptors = entries
      .map(descriptor)
      .reduce<PluginDescriptor<T>[]>((acc, descriptor) => {
        const existing = acc.find(({plugin}) => plugin === descriptor.plugin);

        if (existing) {
          // Keep the first occurrence's position, apply latest options
          existing.options = descriptor.options;
          return acc;
        }

        return [...acc, descriptor];
      }, []);
    const constructors = descriptors.map(({plugin}) => plugin);

    for (const plugin of this.#previousValues) {
      if (!constructors.includes(plugin)) {
        if (plugin.prototype instanceof CorePlugin) {
          continue;
        }

        this.unregister(plugin as W);
      }
    }

    for (const {plugin, options} of descriptors) {
      this.register(plugin as W, options as InferPluginOptions<W>);
    }

    this.#previousValues = constructors;
  }

  /**
   * Gets a plugin instance by its constructor.
   *
   * @param plugin - The plugin constructor to look up
   * @returns The plugin instance or undefined if not found
   */
  public get<X extends W>(plugin: X): InstanceType<X> | undefined {
    const instance = this.instances.get(plugin);

    return instance as any;
  }

  /**
   * Registers a new plugin instance.
   *
   * @param plugin - The plugin constructor to register
   * @param options - Optional configuration for the plugin
   * @returns The registered plugin instance
   * @remarks
   * If the plugin is already registered, its options will be updated
   * and the existing instance will be returned.
   */
  public register<X extends W>(
    plugin: X,
    options?: InferPluginOptions<X>
  ): InstanceType<X> {
    const existingInstance = this.instances.get(plugin);

    if (existingInstance) {
      if (existingInstance.options !== options) {
        existingInstance.options = options;
      }

      return existingInstance as InstanceType<X>;
    }

    const instance = new plugin(this.manager, options) as U;

    this.instances.set(plugin, instance);

    return instance as InstanceType<X>;
  }

  /**
   * Unregisters a plugin instance.
   *
   * @param plugin - The plugin constructor to unregister
   * @remarks
   * This method:
   * - Destroys the plugin instance
   * - Removes it from the registry
   */
  public unregister<X extends W>(plugin: X) {
    const instance = this.instances.get(plugin);

    if (instance) {
      instance.destroy();
      this.instances.delete(plugin);
    }
  }

  /**
   * Destroys all registered plugin instances.
   *
   * @remarks
   * This method:
   * - Calls destroy() on all plugin instances
   * - Clears the registry
   */
  public destroy() {
    for (const plugin of this.instances.values()) {
      plugin.destroy();
    }

    this.instances.clear();
  }
}
