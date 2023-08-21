import type {DragDropManager} from '../manager/index.js';
import type {Plugin} from './plugin.js';

export type PluginOptions = Record<string, any>;

export interface PluginConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends Plugin<T> = Plugin<T>,
  V extends PluginOptions = InferPluginOptions<U>,
> {
  new (manager: T, options?: V): U;
}

export type PluginDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends Plugin<T> = Plugin<T>,
  V extends PluginConstructor<T, U> = PluginConstructor<T, U>,
> = {
  plugin: V;
  options?: InferPluginOptions<U>;
};

export type Plugins<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (PluginConstructor<T> | PluginDescriptor<T>)[];

export type InferPluginOptions<P> = P extends PluginConstructor<
  any,
  any,
  infer T
>
  ? T
  : P extends Plugin<any, infer T>
  ? T
  : never;

export type InferManager<P> = P extends Plugin<
  infer T extends DragDropManager<any, any>
>
  ? T
  : never;
