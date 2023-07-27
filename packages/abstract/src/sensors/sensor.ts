import {CleanupFunction} from '@dnd-kit/types';

import type {DragDropManager} from '../manager';
import type {Draggable} from '../nodes';

export type SensorOptions = Record<string, any>;

export abstract class Sensor<T extends DragDropManager<any, any>> {
  constructor(private manager: T) {}

  abstract bind<U extends Draggable<any>, V extends SensorOptions>(
    source: U,
    options?: V
  ): CleanupFunction;

  abstract destroy: CleanupFunction;
}

export interface SensorConstructor<
  T extends DragDropManager<any, any> = DragDropManager,
> {
  new (manager: T): Sensor<T>;
}

export type SensorDescriptor<
  T extends DragDropManager = DragDropManager,
  U extends SensorOptions = SensorOptions,
> = {
  sensor: SensorConstructor<T>;
  options: U;
};
