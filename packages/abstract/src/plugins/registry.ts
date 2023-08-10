import {DragDropManager} from '../manager';

import type {Plugin} from './plugin';
import type {InferPluginOptions, PluginConstructor} from './types';

export class PluginRegistry<
  T extends DragDropManager<any, any>,
  W extends PluginConstructor<T> = PluginConstructor<T>,
  U extends Plugin<T> = InstanceType<W>,
> {
  private instances: Map<W, U> = new Map();

  constructor(private manager: T) {}

  public [Symbol.iterator]() {
    return this.instances.values();
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
      return existingInstance as InstanceType<X>;
    }

    const instance = new plugin(this.manager, options) as U;

    this.instances.set(plugin, instance);

    return instance as InstanceType<X>;
  }

  public destroy() {
    for (const plugin of this.instances.values()) {
      plugin.destroy();
    }

    this.instances.clear();
  }
}
