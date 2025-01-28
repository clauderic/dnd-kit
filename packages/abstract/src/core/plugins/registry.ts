import {DragDropManager} from '../manager/index.ts';
import {CorePlugin, type Plugin} from './plugin.ts';
import type {
  InferPluginOptions,
  PluginDescriptor,
  PluginConstructor,
  Plugins,
} from './types.ts';
import {descriptor} from './utilities.ts';

export class PluginRegistry<
  T extends DragDropManager<any, any>,
  W extends PluginConstructor<T> = PluginConstructor<T>,
  U extends Plugin<T> = InstanceType<W>,
> {
  private instances: Map<W, U> = new Map();

  constructor(private manager: T) {}

  public get values(): U[] {
    return Array.from(this.instances.values());
  }

  #previousValues: PluginConstructor<T>[] = [];

  public set values(entries: Plugins<T>) {
    const descriptors = entries
      .map(descriptor)
      .reduceRight<PluginDescriptor<T>[]>((acc, descriptor) => {
        if (acc.some(({plugin}) => plugin === descriptor.plugin)) {
          // Filter out duplicate plugins
          return acc;
        }

        return [descriptor, ...acc];
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

  public get<X extends W>(plugin: X): InstanceType<X> | undefined {
    const instance = this.instances.get(plugin);

    return instance as any;
  }

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

  public unregister<X extends W>(plugin: X) {
    const instance = this.instances.get(plugin);

    if (instance) {
      instance.destroy();
      this.instances.delete(plugin);
    }
  }

  public destroy() {
    for (const plugin of this.instances.values()) {
      plugin.destroy();
    }

    this.instances.clear();
  }
}
