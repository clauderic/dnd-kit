import type {DragDropManager} from '../manager';
import type {Plugin} from './plugin';

export interface PluginConstructor<
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
  T extends Plugin<U> = Plugin<U>,
> {
  new (...args: any): T;
}

export type PluginOptions = Record<string, any>;

export type PluginDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends PluginOptions = PluginOptions,
  V extends PluginConstructor<T, Plugin<T>> = PluginConstructor<T, Plugin<T>>,
> = {
  plugin: V;
  options?: U;
};

export type Plugins<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (PluginConstructor<T> | PluginDescriptor<T>)[];
