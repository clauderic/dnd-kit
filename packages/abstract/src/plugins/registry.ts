import {DragDropManager} from '../manager';

import type {Plugin} from './plugin';
import type {PluginConstructor} from './types';

export class PluginRegistry<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  private instances: Map<PluginConstructor<T>, Plugin<T>> = new Map();

  constructor(private manager: T) {}

  public get<S extends PluginConstructor<T>>(
    plugin: S
  ): InstanceType<S> | undefined {
    const instance = this.instances.get(plugin);

    return instance as InstanceType<S> | undefined;
  }

  public register<S extends PluginConstructor<T>>(plugin: S): InstanceType<S> {
    const instance = new plugin(this.manager);

    this.instances.set(plugin, instance);

    return instance as InstanceType<S>;
  }

  public destroy() {
    for (const plugin of this.instances.values()) {
      plugin.destroy();
    }

    this.instances.clear();
  }
}
