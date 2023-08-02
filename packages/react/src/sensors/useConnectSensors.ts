import type {DragDropManager, Draggable} from '@dnd-kit/dom';
import {useIsomorphicLayoutEffect} from '../hooks';
import {SensorDescriptor} from '@dnd-kit/abstract';

export function useConnectSensors(
  sensors: SensorDescriptor[],
  manager: DragDropManager,
  draggable: Draggable
) {
  useIsomorphicLayoutEffect(() => {
    const unbindFunctions = sensors.map(({sensor}) => {
      const sensorInstance =
        manager.sensors.get(sensor) ?? manager.sensors.register(sensor);

      const unbind = sensorInstance.bind(draggable, manager);
      return unbind;
    });

    return function cleanup() {
      unbindFunctions.forEach((unbind) => unbind());
    };
  }, [sensors, manager, draggable]);
}
