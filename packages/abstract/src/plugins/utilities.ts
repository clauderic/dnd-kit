import type {DragDropManager} from '../manager';

import {Plugin} from './plugin';
import type {
  Plugins,
  PluginOptions,
  PluginConstructor,
  PluginDescriptor,
} from './types';

export function configure<
  T extends DragDropManager<any, any>,
  U extends PluginOptions,
  V extends Plugin<T, U>,
  W extends PluginConstructor<T, V>,
>(plugin: W, options?: U): PluginDescriptor<T, U, W> {
  return {
    plugin,
    options,
  };
}

export function descriptor<
  T extends DragDropManager<any, any>,
  U extends PluginOptions,
  V extends Plugin<T, U>,
  W extends PluginConstructor<T, V>,
>(plugin: W | PluginDescriptor<T, U, W>): PluginDescriptor<T, U, W> {
  if (typeof plugin === 'function') {
    return {
      plugin,
      options: undefined,
    };
  }

  return plugin;
}
