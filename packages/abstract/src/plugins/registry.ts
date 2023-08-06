import {DragDropManager} from '../manager';

import type {Plugin} from './plugin';
import type {InferPluginOptions, PluginConstructor} from './types';

export class PluginRegistry<
  T extends DragDropManager<any, any>,
  W extends PluginConstructor = PluginConstructor,
  U extends Plugin = InstanceType<W>,
> {
  private instances: Map<W, U> = new Map();

  constructor(private manager: T) {}

  public [Symbol.iterator]() {
    return this.instances.values();
  }

  public get(plugin: W): U | undefined {
    const instance = this.instances.get(plugin);

    return instance;
  }

  public register(plugin: W, options?: InferPluginOptions<W>): U {
    const instance = new plugin(this.manager, options) as U;

    this.instances.set(plugin, instance);

    return instance;
  }

  public destroy() {
    for (const plugin of this.instances.values()) {
      plugin.destroy();
    }

    this.instances.clear();
  }
}
