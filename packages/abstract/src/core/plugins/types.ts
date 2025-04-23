import type {DragDropManager} from '../manager/index.ts';
import type {Plugin} from './plugin.ts';

/** Base type for plugin options */
export type PluginOptions = Record<string, any>;

/**
 * Constructor type for plugins.
 *
 * @template T - The type of drag and drop manager
 * @template U - The type of plugin instance
 * @template V - The type of plugin options
 */
export interface PluginConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends Plugin<T> = Plugin<T>,
  V extends PluginOptions = InferPluginOptions<U>,
> {
  /** Creates a new plugin instance */
  new (manager: T, options?: V): U;
}

/**
 * Descriptor type for plugins.
 *
 * @template T - The type of drag and drop manager
 * @template U - The type of plugin instance
 * @template V - The type of plugin constructor
 */
export type PluginDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends Plugin<T> = Plugin<T>,
  V extends PluginConstructor<T, U> = PluginConstructor<T, U>,
> = {
  /** The plugin constructor */
  plugin: V;
  /** Optional configuration for the plugin */
  options?: InferPluginOptions<U>;
};

/**
 * Array type for plugin constructors or descriptors.
 *
 * @template T - The type of drag and drop manager
 */
export type Plugins<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (PluginConstructor<T> | PluginDescriptor<T>)[];

/**
 * Infers the options type from a plugin constructor or instance.
 *
 * @template P - The plugin constructor or instance type
 */
export type InferPluginOptions<P> =
  P extends PluginConstructor<any, any, infer T>
    ? T
    : P extends Plugin<any, infer T>
      ? T
      : never;

/**
 * Infers the manager type from a plugin instance.
 *
 * @template P - The plugin instance type
 */
export type InferManager<P> =
  P extends Plugin<infer T extends DragDropManager<any, any>> ? T : never;
