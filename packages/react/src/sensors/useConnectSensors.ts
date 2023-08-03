import type {DragDropManager, Draggable} from '@dnd-kit/dom';
import {Sensor, descriptor, type Sensors} from '@dnd-kit/abstract';
import {useIsomorphicLayoutEffect} from '../hooks';

export function useConnectSensors(
  localSensors: Sensors | undefined,
  manager: DragDropManager,
  draggable: Draggable
) {
  useIsomorphicLayoutEffect(() => {
    const sensors = localSensors?.map(descriptor) ?? [...manager.sensors];
    const unbindFunctions = sensors.map((entry) => {
      const sensorInstance =
        entry instanceof Sensor
          ? entry
          : manager.sensors.get(entry.plugin) ??
            manager.sensors.register(entry.plugin);
      const options = entry instanceof Sensor ? undefined : entry.options;

      const unbind = sensorInstance.bind(draggable, options);
      return unbind;
    });

    return function cleanup() {
      unbindFunctions.forEach((unbind) => unbind());
    };
  }, [localSensors, manager, draggable]);
}
