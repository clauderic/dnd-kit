import {CleanupFunction} from '@dnd-kit/types';

import type {DragDropManager} from '../manager';
import type {Draggable} from '../nodes';
import {
  Plugin,
  type PluginConstructor,
  type PluginDescriptor,
  type PluginOptions,
} from '../plugins';

export type SensorOptions = PluginOptions;

export abstract class Sensor<
  T extends DragDropManager<any, any> = DragDropManager,
  U extends SensorOptions = SensorOptions,
> extends Plugin<T> {
  constructor(manager: T, options?: U) {
    super(manager);
  }

  public abstract bind(source: Draggable, options?: U): CleanupFunction;
}

export type SensorConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends SensorOptions = SensorOptions,
> = PluginConstructor<T, Sensor<T, U>>;

export type SensorDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
  U extends SensorOptions = SensorOptions,
> = PluginDescriptor<T, U, SensorConstructor<T, U>>;

export type Sensors<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (SensorConstructor<T> | SensorDescriptor<T>)[];
