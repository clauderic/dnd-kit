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
  U extends SensorOptions | undefined = SensorOptions,
> extends Plugin<T, U> {
  constructor(
    protected manager: T,
    public options?: U
  ) {
    super(manager);
  }

  /**
   * Bind the sensor to a draggable source, and optionally pass
   * in sensor options to override the default sensor options
   * for this draggable source only.
   */
  public abstract bind(source: Draggable, options?: U): CleanupFunction;
}

export type SensorConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Sensor<T>>;

export type SensorDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginDescriptor<T, Sensor<T>, SensorConstructor<T>>;

export type Sensors<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (SensorConstructor<T> | SensorDescriptor<T>)[];
