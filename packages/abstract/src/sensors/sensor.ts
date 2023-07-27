import {CleanupFunction} from '@dnd-kit/types';

import type {DragDropManager} from '../manager';
import type {Draggable} from '../nodes';
import {Plugin, type PluginConstructor} from '../plugins';

export type SensorOptions = Record<string, any>;

export abstract class Sensor<
  T extends DragDropManager<any, any> = DragDropManager,
  U extends SensorOptions = SensorOptions,
> extends Plugin<T> {
  public abstract bind(source: Draggable, options?: U): CleanupFunction;
}

export type SensorConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Sensor<T>>;

export type SensorDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends SensorOptions = SensorOptions,
> = {
  sensor: SensorConstructor<T>;
  options?: U;
};
