import {useMemo} from 'react';

import type {SensorActivatorFunction, SensorDescriptor} from '../../sensors';
import type {
  SyntheticListener,
  SyntheticListeners,
} from './useSyntheticListeners';

export function useCombineActivators<DraggableData, DroppableData>(
  sensors: SensorDescriptor<any, DraggableData, DroppableData>[],
  getSyntheticHandler: (
    handler: SensorActivatorFunction<any, DraggableData>,
    sensor: SensorDescriptor<any, DraggableData, DroppableData>
  ) => SyntheticListener['handler']
): SyntheticListeners {
  return useMemo(
    () =>
      sensors.reduce<SyntheticListeners>((accumulator, sensor) => {
        const {sensor: Sensor} = sensor;

        const sensorActivators = Sensor.activators.map((activator) => ({
          eventName: activator.eventName,
          handler: getSyntheticHandler(activator.handler, sensor),
        }));

        return [...accumulator, ...sensorActivators];
      }, []),
    [sensors, getSyntheticHandler]
  );
}
