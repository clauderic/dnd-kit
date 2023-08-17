import type {
  PluginConstructor,
  PluginOptions,
  PluginDescriptor,
  InferPluginOptions,
} from './types';

export function configure<
  T extends PluginConstructor<any, any, any>,
  V extends PluginOptions = InferPluginOptions<T>,
>(plugin: T, options: V): PluginDescriptor<any, any, T> {
  return {
    plugin,
    options,
  };
}

export function configurator<T extends PluginConstructor<any, any, any>>(
  plugin: T
) {
  return (options: InferPluginOptions<T>): PluginDescriptor<any, any, T> => {
    return configure(plugin, options);
  };
}

export function descriptor<T extends PluginConstructor<any, any, any>>(
  plugin: T | PluginDescriptor<any, any, T>
): PluginDescriptor<any, any, T> {
  if (typeof plugin === 'function') {
    return {
      plugin,
      options: undefined,
    };
  }

  return plugin;
}
