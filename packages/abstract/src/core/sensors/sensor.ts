import {CleanupFunction} from '@dnd-kit/state';

import type {DragDropManager} from '../manager/index.ts';
import type {Draggable, Droppable} from '../entities/index.ts';
import {
  Plugin,
  type PluginConstructor,
  type PluginDescriptor,
  type PluginOptions,
} from '../plugins/index.ts';

/**
 * Options that can be passed to a sensor.
 * Extends the base PluginOptions type.
 */
export type SensorOptions = PluginOptions;

/**
 * Abstract base class for all sensor implementations.
 *
 * @template T - The type of drag drop manager
 * @template U - The type of sensor options
 *
 * @remarks
 * Sensors are responsible for detecting and initiating drag operations.
 * They handle the actual user interaction (mouse, touch, keyboard, etc.)
 * and translate those interactions into drag operations.
 */
export abstract class Sensor<
  T extends DragDropManager<any, any> = DragDropManager<Draggable, Droppable>,
  U extends SensorOptions = SensorOptions,
> extends Plugin<T, U> {
  /**
   * Creates a new sensor instance.
   *
   * @param manager - The drag drop manager instance
   * @param options - Optional sensor configuration
   */
  constructor(
    public manager: T,
    public options?: U
  ) {
    super(manager, options);
  }

  /**
   * Binds the sensor to a draggable source.
   *
   * @param source - The draggable element to bind to
   * @param options - Optional sensor options specific to this draggable
   * @returns A cleanup function to unbind the sensor
   */
  public abstract bind(source: Draggable, options?: U): CleanupFunction;
}

/**
 * Constructor type for creating sensor instances.
 *
 * @template T - The type of drag drop manager
 */
export type SensorConstructor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginConstructor<T, Sensor<T>>;

/**
 * Descriptor type for configuring sensors.
 *
 * @template T - The type of drag drop manager
 */
export type SensorDescriptor<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = PluginDescriptor<T, Sensor<T>, SensorConstructor<T>>;

/**
 * Array type for multiple sensor configurations.
 *
 * @template T - The type of drag drop manager
 */
export type Sensors<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> = (SensorConstructor<T> | SensorDescriptor<T>)[];
