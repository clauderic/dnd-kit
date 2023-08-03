import {DragDropManager} from '../manager';

import type {Plugin} from './plugin';
import type {PluginConstructor, PluginOptions} from './types';

export class PluginRegistry<
  T extends DragDropManager<any, any>,
  U extends Plugin<T> = Plugin<T>,
  V extends PluginConstructor<T, U> = PluginConstructor<T, U>,
> {
  private instances: Map<V, U> = new Map();

  constructor(private manager: T) {}

  public [Symbol.iterator]() {
    return this.instances.values();
  }

  public get(plugin: V): U | undefined {
    const instance = this.instances.get(plugin);

    return instance;
  }

  public register(plugin: V, options?: PluginOptions): U {
    const instance = new plugin(this.manager, options);

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
