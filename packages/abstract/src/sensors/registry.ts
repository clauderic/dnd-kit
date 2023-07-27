import {DragDropManager} from '../manager';

import type {Sensor, SensorConstructor} from './sensor';

export class SensorRegistry<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  private sensors: Map<SensorConstructor<T>, Sensor<T>> = new Map();

  constructor(private manager: T) {}

  public register<S extends SensorConstructor<T>>(sensor: S) {
    this.sensors.set(sensor, new sensor(this.manager));
  }

  public destroy() {
    for (const sensor of this.sensors.values()) {
      sensor.destroy();
    }

    this.sensors.clear();
  }
}
