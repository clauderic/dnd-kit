import type {
  PluginConstructor,
  PluginOptions,
  PluginDescriptor,
  InferPluginOptions,
} from './types.ts';

/**
 * Creates a plugin descriptor with the given plugin constructor and options.
 *
 * @template T - The plugin constructor type
 * @template V - The plugin options type
 * @param plugin - The plugin constructor
 * @param options - The plugin configuration options
 * @returns A plugin descriptor containing the constructor and options
 */
export function configure<
  T extends PluginConstructor<any, any, any>,
  V extends PluginOptions = InferPluginOptions<T>,
>(plugin: T, options: V): PluginDescriptor<any, any, T> {
  return {
    plugin,
    options,
  };
}

/**
 * Creates a configurator function for a specific plugin constructor.
 *
 * @template T - The plugin constructor type
 * @param plugin - The plugin constructor to configure
 * @returns A function that takes options and returns a plugin descriptor
 */
export function configurator<T extends PluginConstructor<any, any, any>>(
  plugin: T
) {
  return (options: InferPluginOptions<T>): PluginDescriptor<any, any, T> => {
    return configure(plugin, options);
  };
}

/**
 * Normalizes a plugin constructor or descriptor into a descriptor.
 *
 * @template T - The plugin constructor type
 * @param plugin - Either a plugin constructor or a plugin descriptor
 * @returns A plugin descriptor
 */
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
